import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

export function AnimatedSplashOverlay() {
  return null;
}

export function AnimatedIcon() {
  return (
    <View style={styles.iconContainer}>
      <View style={styles.background} />
      <View style={styles.imageContainer}>
        <Image style={styles.image} source={require('@/assets/images/expo-logo.png')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 120,
    height: 120,
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: 100,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    backgroundColor: '#000000',
  },
  image: {
    width: 64,
    height: 64,
  },
});
