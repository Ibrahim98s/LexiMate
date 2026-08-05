import React, { useState, useEffect } from 'react';
import { Tabs, useRouter, usePathname } from 'expo-router';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../../store/authStore';

function getAvatarKey(userEmail: string | null | undefined) {
    return `leximate_avatar_uri_${userEmail || 'anonymous'}`;
}

function TabIcon({
                     name,
                     color,
                     focused,
                 }: {
    name: keyof typeof Ionicons.glyphMap;
    color: string;
    focused: boolean;
}) {
    return (
        <View style={[styles.iconWrapper, focused && styles.iconWrapperFocused]}>
            <Ionicons name={name} size={22} color={color} />
        </View>
    );
}

export default function TabsLayout() {
    const router = useRouter();
    const pathname = usePathname();
    const userEmail = useAuthStore((state) => state.userEmail);
    const [avatarUri, setAvatarUri] = useState<string | null>(null);

    useEffect(() => {
        AsyncStorage.getItem(getAvatarKey(userEmail)).then((uri) => {
            setAvatarUri(uri || null);
        });
    }, [userEmail, pathname]);

    return (
        <Tabs
            backBehavior="history"
            screenOptions={{
                tabBarActiveTintColor: '#2DD4BF',
                tabBarInactiveTintColor: '#8A9BBF',
                tabBarShowLabel: true,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                },
                tabBarStyle: {
                    backgroundColor: '#132240',
                    borderTopColor: '#2DD4BF',
                    borderTopWidth: 1,
                    height: 64,
                    paddingTop: 8,
                    paddingBottom: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 10,
                    elevation: 12,
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
                        {avatarUri ? (
                            <Image source={{ uri: avatarUri }} style={styles.headerAvatar} />
                        ) : (
                            <Ionicons name="person-circle-outline" size={26} color="#F0F4FF" />
                        )}
                    </TouchableOpacity>
                ),
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon name={focused ? 'home' : 'home-outline'} color={color} focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    title: 'History',
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon name={focused ? 'time' : 'time-outline'} color={color} focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="ask"
                options={{
                    title: 'Ask',
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon
                            name={focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'}
                            color={color}
                            focused={focused}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="compare"
                options={{
                    title: 'Compare',
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon
                            name={focused ? 'git-compare' : 'git-compare-outline'}
                            color={color}
                            focused={focused}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    iconWrapper: {
        width: 36,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
    },
    iconWrapperFocused: {
        backgroundColor: 'rgba(45,212,191,0.15)',
    },
    headerAvatar: {
        width: 26,
        height: 26,
        borderRadius: 13,
        borderWidth: 1,
        borderColor: '#2DD4BF',
    },
});