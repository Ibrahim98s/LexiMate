import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

export default function TabsLayout() {
    const router = useRouter();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#1B4FD8',
                tabBarInactiveTintColor: '#4A5A7A',
                tabBarStyle: {
                    backgroundColor: '#132240',
                    borderTopColor: '#2A4470',
                },
                headerStyle: {
                    backgroundColor: '#0A1628',
                },
                headerTintColor: '#F0F4FF',
                headerRight: () => (
                    <TouchableOpacity
                        onPress={() => router.push('/profile')}
                        style={{ marginRight: 16 }}
                    >
                        <Ionicons name="person-circle-outline" size={26} color="#F0F4FF" />
                    </TouchableOpacity>
                ),
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    title: 'History',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="time-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="ask"
                options={{
                    title: 'Ask',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="chatbubble-ellipses-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="compare"
                options={{
                    title: 'Compare',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="git-compare-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}