import React, { useState, useEffect } from 'react'
import {
  View, Text, Button, Alert,
  StyleSheet, ActivityIndicator
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { fetchCommonSenseDetail, CommonSense, apiVote } from '../utils/api'
import { getCurrentUserId } from '../utils/auth'

type Params = { csId: string }

export default function VoteScreen() {
  const router = useRouter()
  const { csId } = useLocalSearchParams<Params>()
  const [cs, setCs] = useState<CommonSense|null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!csId) { router.back(); return }
    ;(async () => {
      setLoading(true)
      try {
        const detail = await fetchCommonSenseDetail(Number(csId))
        setCs(detail)
      } catch {
        Alert.alert('エラー','常識の取得に失敗しました')
        router.back()
      } finally {
        setLoading(false)
      }
    })()
  }, [csId])

  const handleVote = async (recognized: boolean) => {
    const userId = await getCurrentUserId()
    if (!userId) {
      Alert.alert('エラー','ログイン情報が見つかりません')
      return
    }
    setLoading(true)
    try {
      await apiVote({ user_id:userId, common_sense_id:Number(csId), recognized })
      Alert.alert('投票完了', recognized ? '知っていたです' : '知らなかったです')
      router.replace('/')
    } catch {
      Alert.alert('エラー','投票に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (loading || !cs) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large"/>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{cs.title}</Text>
      <Text style={styles.content}>{cs.content}</Text>
      <View style={styles.buttons}>
        <Button title="知っていた" onPress={()=>handleVote(true)}/>
        <View style={styles.spacer}/>
        <Button title="知らなかった" onPress={()=>handleVote(false)}/>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container:{flex:1,padding:16,backgroundColor:'#fff'},
  center:{flex:1,justifyContent:'center',alignItems:'center'},
  title:{fontSize:20,fontWeight:'700',marginBottom:12},
  content:{fontSize:16,marginBottom:24},
  buttons:{flexDirection:'row',justifyContent:'center'},
  spacer:{width:16},
})