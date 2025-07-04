import * as Notifications from 'expo-notifications'

/**
 * 指定した常識(id, title, content)を即時にローカル通知で表示する
 */
export async function sendCommonSenseNotification(
  id: number,
  notifTitle: string,
  notifBody: string
): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: notifTitle,
        body: notifBody,
        data: { commonSenseId: id },
      },
      // trigger:null で「即時通知」。バックグラウンドでも動けばOK
      trigger: null,
    })
  } catch (e) {
    console.error('sendCommonSenseNotification error:', e)
  }
}