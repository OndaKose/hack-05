// frontend/utils/notifications.ts
import * as Notifications from 'expo-notifications';

export async function sendCommonSenseNotification(id: number, title: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,                                           // 通知タイトルに「駅」など
      body: 'タップして詳細を確認',                    // 任意
      data: { commonSenseId: id },                     // タップ時に参照する ID
    },
    trigger: null, // 即時通知
  });
}