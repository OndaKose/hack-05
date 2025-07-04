// frontend/declarations.d.ts
declare module 'expo-secure-store' {
  /**
   * キーから文字列を取得します。
   * 存在しなければ null を返します。
   */
  export function getItemAsync(
    key: string,
    options?: any
  ): Promise<string | null>;

  /**
   * キーに文字列を保存します。
   */
  export function setItemAsync(
    key: string,
    value: string,
    options?: any
  ): Promise<void>;

  /**
   * キーを削除します。
   */
  export function deleteItemAsync(
    key: string,
    options?: any
  ): Promise<void>;
}