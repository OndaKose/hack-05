// frontend/utils/notifications.ts
import * as Notifications from 'expo-notifications'

/**
 * CommonSense 通知をスケジュールするヘルパー
 * @param id       常識アイテムの ID
 * @param title    通知のタイトル
 * @param body     通知の本文
 */
export async function sendCommonSenseNotification(
  id: number,
  title: string,
  body: string
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { id },
    },
    trigger: null,  // 即時
  })
}