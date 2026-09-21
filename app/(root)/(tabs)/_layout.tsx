import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf="house.fill" drawable="ic_home" />
        <Label>Home</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="search">
        <Icon sf="magnifyingglass" drawable="ic_search" />
        <Label>Search</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="saved">
        <Icon sf="heart.fill" drawable="ic_favorite" />
        <Label>Saved</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <Icon sf="person.fill" drawable="ic_person" />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
