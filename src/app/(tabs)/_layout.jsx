import { Tabs } from "expo-router";
import { Image, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Put your icon files here and adjust the names/extensions to match
const icons = {
  home: require("../../../assets/icons/home.png"),
  news: require("../../../assets/icons/home.png"),
  library: require("../../../assets/icons/home.png"),
  profile: require("../../../assets/icons/home.png"),
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
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#8E8E93",
        headerStyle: { backgroundColor: "#fff" },
        tabBarButton: (props) => (
          <Pressable {...props} android_ripple={{ color: "transparent" }} />
        ),
        tabBarStyle: {
          backgroundColor: "#fff",
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
