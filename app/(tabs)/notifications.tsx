import { LMN8Colors, LMN8Spacing, LMN8Typography } from '@/constants/LMN8DesignSystem';
import { api } from '@/services/APIService';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
type Notice = { id: number; message: string; is_read: boolean; created_at: string };
export default function NotificationsScreen() {
 const router=useRouter(); const [items,setItems]=useState<Notice[]>([]); const [loading,setLoading]=useState(true);
 const load=useCallback(async()=>{ setLoading(true); const r=await api.get<{notifications?:Notice[]}>('/api/notifications'); if(r.success) setItems(r.data?.notifications||[]); setLoading(false); },[]);
 useFocusEffect(useCallback(()=>{load();},[load]));
 const open=async(n:Notice)=>{ if(!n.is_read) { await api.patch('/api/notifications',{id:n.id}); setItems(x=>x.map(i=>i.id===n.id?{...i,is_read:true}:i)); } router.push('/(tabs)/homework'); };
 return <View style={s.container}><View style={s.header}><Text style={s.title}>Notifications</Text></View>{loading?<ActivityIndicator color={LMN8Colors.accentPrimary}/>:<ScrollView contentContainerStyle={s.list}>{items.length===0?<Text style={s.empty}>You have no notifications.</Text>:items.map(n=><TouchableOpacity key={n.id} style={[s.card,!n.is_read&&s.unread]} onPress={()=>open(n)}><Ionicons name="notifications-outline" size={20} color={LMN8Colors.accentPrimary}/><View style={s.copy}><Text style={s.message}>{n.message}</Text><Text style={s.date}>{new Date(n.created_at).toLocaleDateString()}</Text></View></TouchableOpacity>)}</ScrollView>}</View>;
}
const s=StyleSheet.create({container:{flex:1,backgroundColor:LMN8Colors.bgDark,padding:LMN8Spacing.lg,paddingTop:58},header:{marginBottom:LMN8Spacing.xl},title:{...LMN8Typography.h1,fontSize:30},list:{paddingBottom:100},card:{flexDirection:'row',gap:12,backgroundColor:LMN8Colors.container,borderRadius:14,padding:16,marginBottom:10,borderWidth:1,borderColor:'#ffffff12'},unread:{borderColor:'#17706e66'},copy:{flex:1},message:{...LMN8Typography.body,color:LMN8Colors.text100,fontSize:15,lineHeight:22},date:{...LMN8Typography.caption,marginTop:6},empty:{...LMN8Typography.body,color:LMN8Colors.text60,textAlign:'center',marginTop:80}});
