export const safetyQuestions = [
  { title: '浴室地面，平常是否容易濕滑？', area: '浴室防滑', tip: '優先處理積水、固定容易滑動的地墊，並請專業人員評估防滑與扶手位置。' },
  { title: '常走的通道，是否有雜物、電線或容易絆到的門檻？', area: '日常動線', tip: '先清出常走的通道、固定電線；門檻改善可交由顧問現場確認。' },
  { title: '晚上從床邊走到廁所，是否有光線不足的地方？', area: '夜間照明', tip: '先確認床邊到廁所的照明與開關位置，讓起身時能看清動線。' },
  { title: '坐下、起身或上下樓梯時，是否缺少穩固支撐？', area: '起身與支撐', tip: '避免扶靠會移動的家具，請專業人員確認適合的扶手與支撐配置。' },
  { title: '常用物品，是否需要爬高、彎腰或踮腳才拿得到？', area: '物品取用', tip: '把常用物品移至容易拿取的位置，減少爬高與勉強伸手。' },
  { title: '需要幫忙時，是否可能拿不到電話或無法聯絡家人？', area: '聯絡安排', tip: '確認常待的位置都能方便取得聯絡工具，並和家人約定聯繫方式。' },
];
export type RentalInputs = { rent: number; vacancy: number; management: number; repairs: number; setup: number };
export function calculateRental(input: RentalInputs) {
  const { rent, vacancy, management, repairs, setup } = input;
  if (![rent, vacancy, management, repairs, setup].every(Number.isFinite) || rent <= 0 || rent > 1000000 || vacancy < 0 || vacancy > 12 || management < 0 || management > 100 || repairs < 0 || repairs > 1000000 || setup < 0 || setup > 10000000) throw new Error('請填寫有效的試算數值');
  const gross = rent * (12 - vacancy);
  const fee = gross * management / 100;
  const net = gross - fee - repairs - setup;
  return { gross, fee, net, monthly: net / 12 };
}
