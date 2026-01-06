import { supabase } from '@/src/lib/supabase';

/**
 * Save push subscription to database
 */
export const savePushSubscription = async (
  userId: string,
  subscription: PushSubscriptionJSON
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('PushSubscription')
      .upsert(
        {
          user_id: userId,
          endpoint: subscription.endpoint,
          p256dh_key: subscription.keys?.p256dh,
          auth_key: subscription.keys?.auth,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id',
        }
      );

    if (error) {
      console.error('Error saving push subscription:', error);
      return { success: false, error: error.message };
    }

    console.log('Push subscription saved successfully');
    return { success: true };
  } catch (error) {
    console.error('Exception saving push subscription:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Delete push subscription from database
 */
export const deletePushSubscription = async (
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('PushSubscription')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting push subscription:', error);
      return { success: false, error: error.message };
    }

    console.log('Push subscription deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('Exception deleting push subscription:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Get user's push subscription from database
 */
export const getPushSubscription = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('PushSubscription')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error getting push subscription:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception getting push subscription:', error);
    return null;
  }
};

/**
 * Check if user has an active push subscription
 */
export const hasActivePushSubscription = async (userId: string): Promise<boolean> => {
  const subscription = await getPushSubscription(userId);
  return subscription !== null;
};
