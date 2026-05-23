/**
 * 誕生日当日に年齢が上がる。
 * baseDate 省略時は現在日時を使用。
 */
export function calcAge(birthDate: Date, baseDate: Date = new Date()): number {
  const age = baseDate.getFullYear() - birthDate.getFullYear()
  const hasHadBirthdayThisYear =
    baseDate.getMonth() > birthDate.getMonth() ||
    (baseDate.getMonth() === birthDate.getMonth() &&
      baseDate.getDate() >= birthDate.getDate())
  return hasHadBirthdayThisYear ? age : age - 1
}
