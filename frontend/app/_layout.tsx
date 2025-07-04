// frontend/app/_layout.tsx

import React, { useEffect } from 'react'
import { Slot, useRouter } from 'expo-router'
import * as Notifications from 'expo-notifications'

// フォアグラウンドでもバナー／リスト表示
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert:  true,
    shouldShowBanner: true,
    shouldShowList:   true,
    shouldPlaySound:  false,
    shouldSetBadge:   false,
  }),
})

export default function RootLayout() {
  const router = useRouter()

  useEffect(() => {
    // 通知をタップしたときのリスナー
    const sub = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data as { id: number }
      // /common-sense/[id] へ遷移
      router.push({
        pathname: '/common-sense/[id]',
        params:   { id: String(data.id) },
      })
    })
    return () => {
      sub.remove()
    }
  }, [router])

  return <Slot />
}