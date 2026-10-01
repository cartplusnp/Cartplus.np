import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { SupportRequest, SupportCategory, SupportStatus, SupportMessage } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface CreateTicketParams {
  userName: string;
  userEmail: string;
  userPhone?: string;
  category: SupportCategory;
  orderId?: string;
  subject: string;
  message: string;
  userId?: string;
}

interface SupportContextType {
  requests: SupportRequest[];
  isLoading: boolean;
  createRequest: (params: CreateTicketParams) => Promise<SupportRequest | null>;
  getRequestById: (id: string) => SupportRequest | undefined;
  addMessage: (requestId: string, message: string, sender: 'customer' | 'support', senderName: string) => Promise<void>;
  updateStatus: (requestId: string, status: SupportStatus) => Promise<void>;
  getUserRequests: (email?: string) => SupportRequest[];
  refreshRequests: () => Promise<void>;
}

const SupportContext = createContext<SupportContextType | undefined>(undefined);

export const SupportProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { success, error: toastError, info } = useToast();

  const fetchRequests = useCallback(async () => {
    if (!isSupabaseConfigured) return;

    try {
      let rawData: any[] | null = null;
      let rawMessages: Record<string, any[]> = {};

      // 1. Attempt joined query first
      let query = supabase
        .from('support_requests')
        .select(`
          *,
          support_messages (
            id,
            request_id,
            sender_id,
            sender_role,
            message,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (user && user.role !== 'admin') {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        // Schema cache relationship missing or other error: fallback to flat query
        console.warn('Notice: Joined support_messages query unavailable, using resilient fallback:', error.message);

        let flatQuery = supabase
          .from('support_requests')
          .select('*')
          .order('created_at', { ascending: false });

        if (user && user.role !== 'admin') {
          flatQuery = flatQuery.eq('user_id', user.id);
        }

        const { data: flatData, error: flatError } = await flatQuery;

        if (flatError) {
          console.warn('Error fetching support requests:', flatError.message);
          return;
        }

        rawData = flatData;

        // Try querying messages separately
        if (rawData && rawData.length > 0) {
          try {
            const reqIds = rawData.map((r: any) => r.id).filter(Boolean);
            if (reqIds.length > 0) {
              const { data: msgData, error: msgError } = await supabase
                .from('support_messages')
                .select('id, request_id, sender_id, sender_role, message, created_at')
                .in('request_id', reqIds)
                .order('created_at', { ascending: true });

              if (!msgError && msgData) {
                msgData.forEach((m: any) => {
                  if (!rawMessages[m.request_id]) rawMessages[m.request_id] = [];
                  rawMessages[m.request_id].push(m);
                });
              }
            }
          } catch {
            // Ignore secondary message query error
          }
        }
      } else {
        rawData = data;
      }

      if (rawData) {
        setRequests(
          rawData.map((r: any) => {
            const messagesList = r.support_messages || rawMessages[r.id] || [];
            const msgs: SupportMessage[] = messagesList
              .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
              .map((m: any) => ({
                id: m.id,
                request_id: m.request_id,
                sender_id: m.sender_id,
                sender: m.sender_role === 'customer' ? 'customer' : 'support',
                sender_name: m.sender_role === 'customer' ? r.user_name || 'Customer' : 'CARTPLUS Support Helpdesk',
                message: m.message,
                created_at: m.created_at,
              }));

            return {
              id: r.id,
              ticket_number: r.ticket_number,
              user_id: r.user_id,
              user_name: r.user_name || 'Customer',
              user_email: r.user_email || '',
              user_phone: r.user_phone || undefined,
              category: r.category,
              order_id: r.order_id || undefined,
              subject: r.subject,
              message: r.message,
              status: r.status,
              created_at: r.created_at,
              updated_at: r.updated_at,
              messages: msgs,
            };
          })
        );
      }
    } catch (err) {
      console.error('Support requests load exception:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests, user]);

  const createRequest = async (params: CreateTicketParams): Promise<SupportRequest | null> => {
    const ticketNumber = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;

    if (!isSupabaseConfigured) {
      const localReq: SupportRequest = {
        id: `tkt-${Date.now()}`,
        ticket_number: ticketNumber,
        user_id: params.userId || user?.id,
        user_name: params.userName,
        user_email: params.userEmail,
        user_phone: params.userPhone,
        category: params.category,
        order_id: params.orderId,
        subject: params.subject,
        message: params.message,
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        messages: [
          {
            id: `msg-${Date.now()}`,
            request_id: `tkt-${Date.now()}`,
            sender: 'customer',
            sender_name: params.userName,
            message: params.message,
            created_at: new Date().toISOString(),
          },
        ],
      };
      setRequests((prev) => [localReq, ...prev]);
      success(`Support ticket ${ticketNumber} opened successfully.`);
      return localReq;
    }

    try {
      const { data: ticketRow, error: ticketErr } = await supabase
        .from('support_requests')
        .insert({
          ticket_number: ticketNumber,
          user_id: params.userId || user?.id || null,
          category: params.category,
          order_id: params.orderId || null,
          subject: params.subject.trim(),
          message: params.message.trim(),
          status: 'open',
        })
        .select()
        .single();

      if (ticketErr) {
        toastError(ticketErr.message);
        return null;
      }

      // Add initial message
      await supabase.from('support_messages').insert({
        request_id: ticketRow.id,
        sender_id: user?.id || null,
        sender_role: 'customer',
        message: params.message.trim(),
      });

      const newTicket: SupportRequest = {
        id: ticketRow.id,
        ticket_number: ticketRow.ticket_number,
        user_id: ticketRow.user_id,
        user_name: params.userName,
        user_email: params.userEmail,
        user_phone: params.userPhone,
        category: ticketRow.category,
        order_id: ticketRow.order_id || undefined,
        subject: ticketRow.subject,
        message: ticketRow.message,
        status: ticketRow.status,
        created_at: ticketRow.created_at,
        updated_at: ticketRow.updated_at,
        messages: [
          {
            id: `msg-${Date.now()}`,
            request_id: ticketRow.id,
            sender: 'customer',
            sender_name: params.userName,
            message: params.message,
            created_at: ticketRow.created_at,
          },
        ],
      };

      setRequests((prev) => [newTicket, ...prev]);
      success(`Support ticket ${ticketNumber} created. Our team will review it.`);
      return newTicket;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create support ticket';
      toastError(msg);
      return null;
    }
  };

  const addMessage = async (
    requestId: string,
    message: string,
    sender: 'customer' | 'support',
    senderName: string
  ) => {
    if (!isSupabaseConfigured) {
      const newMsg: SupportMessage = {
        id: `msg-${Date.now()}`,
        request_id: requestId,
        sender,
        sender_name: senderName,
        message,
        created_at: new Date().toISOString(),
      };
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, messages: [...r.messages, newMsg], updated_at: new Date().toISOString() }
            : r
        )
      );
      success('Reply sent.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('support_messages')
        .insert({
          request_id: requestId,
          sender_id: user?.id || null,
          sender_role: sender === 'support' ? 'admin' : 'customer',
          message: message.trim(),
        })
        .select()
        .single();

      if (error) {
        toastError(error.message);
        return;
      }

      const msgObj: SupportMessage = {
        id: data.id,
        request_id: data.request_id,
        sender,
        sender_name: senderName,
        message: data.message,
        created_at: data.created_at,
      };

      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, messages: [...r.messages, msgObj], updated_at: new Date().toISOString() }
            : r
        )
      );
      success('Message recorded.');
    } catch (err) {
      console.error('Add message error:', err);
    }
  };

  const updateStatus = async (requestId: string, status: SupportStatus) => {
    if (!isSupabaseConfigured) {
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status, updated_at: new Date().toISOString() } : r))
      );
      success(`Ticket status updated to ${status}.`);
      return;
    }

    try {
      const { error } = await supabase
        .from('support_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (error) {
        toastError(error.message);
        return;
      }

      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status, updated_at: new Date().toISOString() } : r))
      );
      success(`Ticket status updated to ${status}.`);
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  const getRequestById = (id: string) => {
    return requests.find((r) => r.id === id || r.ticket_number === id);
  };

  const getUserRequests = (email?: string) => {
    if (user?.id) {
      return requests.filter((r) => r.user_id === user.id);
    }
    if (email) {
      return requests.filter((r) => r.user_email.toLowerCase() === email.toLowerCase());
    }
    return [];
  };

  return (
    <SupportContext.Provider
      value={{
        requests,
        isLoading,
        createRequest,
        getRequestById,
        addMessage,
        updateStatus,
        getUserRequests,
        refreshRequests: fetchRequests,
      }}
    >
      {children}
    </SupportContext.Provider>
  );
};

export const useSupport = () => {
  const context = useContext(SupportContext);
  if (!context) {
    throw new Error('useSupport must be used within a SupportProvider');
  }
  return context;
};
