import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../application/navigation/types'
import { SignInScreen } from './SignInScreen'

type Props = NativeStackScreenProps<RootStackParamList, 'AuthPreview'>

export function AuthPreviewScreen({ navigation }: Props) {
  return (
    <SignInScreen
      previewMode
      onClose={() => navigation.goBack()}
    />
  )
}
