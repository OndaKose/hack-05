import 'react-native';
import { NativeWindStyleSheet } from 'nativewind';

declare module 'react-native' {
  interface ViewProps extends NativeWindStyleSheet {}
  interface TextProps extends NativeWindStyleSheet {}
  interface ImageProps extends NativeWindStyleSheet {}
  interface ScrollViewProps extends NativeWindStyleSheet {}
  interface PressableProps extends NativeWindStyleSheet {}
}