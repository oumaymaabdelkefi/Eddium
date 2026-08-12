import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  return (
    <View style={{
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#ECF6FF',
    }}>
      <ActivityIndicator size="large" color="#2D9596" />
    </View>
  );
}