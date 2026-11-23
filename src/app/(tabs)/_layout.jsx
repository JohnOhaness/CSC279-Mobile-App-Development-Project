import { Tabs } from "expo-router";
import { Image, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";

// Put your icon files here and adjust the names/extensions to match
const icons = {
  home: require("../../../assets/icons/home.png"),
  news: require("../../../assets/icons/news.png"),
  library: require("../../../assets/icons/library.png"),
  profile: require("../../../assets/icons/profile.png"),
};

function TabIcon({ source, color }) {
  return (
    <Image
      source={source}
      style={{ width: 24, height: 24, tintColor: color }}
      resizeMode="contain"
    />
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  const EXTRA_HEIGHT = 20;
  const ICONS_UP = 15;
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        tabBarButton: (props) => (
          <Pressable {...props} android_ripple={{ color: "transparent" }} />
        ),
        tabBarStyle: {
          backgroundColor: colors.background,
          height: 49 + insets.bottom + EXTRA_HEIGHT,
          paddingBottom: insets.bottom + (ICONS_UP - EXTRA_HEIGHT / 2) * 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <TabIcon source={icons.home} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: "News",
          tabBarIcon: ({ color }) => (
            <TabIcon source={icons.news} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: ({ color }) => (
            <TabIcon source={icons.library} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <TabIcon source={icons.profile} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
