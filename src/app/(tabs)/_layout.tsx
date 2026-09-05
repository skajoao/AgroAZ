import { Colors } from "@/constants/theme";
import { NativeTabs } from "expo-router/unstable-native-tabs";

export default function TabLayout() {
  return (
    <NativeTabs
      backgroundColor={Colors.primary}
      tintColor="#ffffff"
      disableIndicator
      

    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>
          Dashboard
        </NativeTabs.Trigger.Label>

        <NativeTabs.Trigger.Icon
          src={require("../../assets/painel.png")}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="listTalhoesRoute">
        <NativeTabs.Trigger.Label>
          Talhões
        </NativeTabs.Trigger.Label>

        <NativeTabs.Trigger.Icon
          src={require("../../assets/talhao.png")}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="listInsumosRoute">
        <NativeTabs.Trigger.Label>
            Insumos
        </NativeTabs.Trigger.Label>
        
    <NativeTabs.Trigger.Icon src={require("../../assets/insumos.png")}/>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}