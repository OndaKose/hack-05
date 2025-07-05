// frontend/utils/notifications.ts

import * as Notifications from 'expo-notifications'

export async function sendCommonSenseNotification(
  id: number,
  title: string,
  body: string
): Promise<void> {
  // 通知ハンドラ設定
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner:  true,
      shouldShowList:    true,
      shouldPlaySound:   false,
      shouldSetBadge:    false,
    }),
  })

  const content = { title, body, data: { id } }

  // 即時通知だけをスケジュール（どんな状態でも即時発火）
  await Notifications.scheduleNotificationAsync({
    content,
    trigger: null,  // null = 即時発火
  })
}