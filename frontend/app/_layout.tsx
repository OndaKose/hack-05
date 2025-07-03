// frontend/app/_layout.tsx
import React, { useRef, useEffect } from 'react'
import { Slot, useRouter } from 'expo-router'
import * as Notifications from 'expo-notifications'
import { Alert } from 'react-native'

// フォアグラウンドでもダイアログで通知を表示
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

export default function RootLayout() {
  const router = useRouter()
  // 通知レスポンスの購読ハンドル
  const responseListener = useRef<Notifications.Subscription | null>(null)

  useEffect(() => {
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      response => {
        const data = response.notification.request.content.data
        Alert.alert(
          `【${data.genre}】の常識`,
          data.content as string
        )
        // ここで detail ページに遷移するなら：
        // router.push(`/common-sense/${data.id}`)
      }
    )
    return () => {
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current)
      }
    }
  }, [])

  return <Slot />
}