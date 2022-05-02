// @ts-nocheck
export class Dropper {
  static async getColor(): Promise<string | null> {
    try {
      if (!window.EyeDropper) {
        alert(
          "지원되지 않는 브라우저입니다. 최신 버전의 크롬을 이용해 주세요."
        );
        return;
      }

      const dropper = new EyeDropper();
      const result = await dropper.open();
      return result.sRGBHex;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
