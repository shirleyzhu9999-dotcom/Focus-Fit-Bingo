import { Task } from '../types';

export const TASK_POOL: Task[] = [
  // Diet Management (8+ tasks)
  { id: 'd1', text: '今天没喝含糖饮料', category: 'diet', intensity: 'low' },
  { id: 'd2', text: '试试用小盘子控制分量', category: 'diet', intensity: 'low' },
  { id: 'd3', text: '吃1份高蛋白食物（如鸡蛋/鸡胸肉）', category: 'diet', intensity: 'low' },
  { id: 'd4', text: '晚餐尝试少油少糖', category: 'diet', intensity: 'medium' },
  { id: 'd5', text: '精制碳水（米面）尝试减半', category: 'diet', intensity: 'medium' },
  { id: 'd6', text: '想吃零食时，先喝三口水试试', category: 'diet', intensity: 'low' },
  { id: 'd7', text: '三餐规律，不开启“暴饮暴食”模式', category: 'diet', intensity: 'medium' },
  { id: 'd8', text: '主动喝水，不等到口渴才找水', category: 'diet', intensity: 'low' },
  { id: 'd9', text: '多吃一拳头量的绿叶蔬菜', category: 'diet', intensity: 'low' },
  { id: 'd10', text: '晚餐少吃点碳水，给肚子减负', category: 'diet', intensity: 'medium', bodyTypeFocus: 'apple' },

  // Light Exercise (7+ tasks)
  { id: 'e1', text: '工作间隙拉伸腰腹1分钟', category: 'exercise', intensity: 'low', bodyTypeFocus: 'apple' },
  { id: 'e2', text: '3分钟腹部激活（吸气收腹试试）', category: 'exercise', intensity: 'low', bodyTypeFocus: 'apple' },
  { id: 'e3', text: '5分钟原地快走或开合跳', category: 'exercise', intensity: 'high' },
  { id: 'e4', text: '下班多走1-2站路（约5分钟）', category: 'exercise', intensity: 'high' },
  { id: 'e5', text: '午休出门走走5分钟', category: 'exercise', intensity: 'medium' },
  { id: 'e6', text: '饭后站5分钟不坐下', category: 'exercise', intensity: 'low' },
  { id: 'e7', text: '完成1套超短腰腹训练（3分钟）', category: 'exercise', intensity: 'high', bodyTypeFocus: 'apple' },
  { id: 'e8', text: '刷牙时尝试踮脚尖20次', category: 'exercise', intensity: 'low', bodyTypeFocus: 'pear' },
  { id: 'e9', text: '爬楼梯代替电梯（限5分钟内）', category: 'exercise', intensity: 'medium' },
  { id: 'e10', text: '3分钟平板支撑挑战', category: 'exercise', intensity: 'high', bodyTypeFocus: 'apple' },
  { id: 'e12', text: '5分钟腹式呼吸练习', category: 'exercise', intensity: 'low', bodyTypeFocus: 'apple' },
  { id: 'e13', text: '3分钟靠墙蹲', category: 'exercise', intensity: 'high', bodyTypeFocus: 'pear' },
  { id: 'e14', text: '4分钟侧卧抬腿', category: 'exercise', intensity: 'medium', bodyTypeFocus: 'pear' },
  { id: 'e15', text: '5分钟原地深蹲', category: 'exercise', intensity: 'high', bodyTypeFocus: 'pear' },
  { id: 'e16', text: '2分钟臀桥练习', category: 'exercise', intensity: 'medium', bodyTypeFocus: 'pear' },
  { id: 'e17', text: '3分钟大腿内侧拉伸', category: 'exercise', intensity: 'low', bodyTypeFocus: 'pear' },
  { id: 'e18', text: '3分钟肩颈放松', category: 'exercise', intensity: 'low' },
  
  // Apple Type Specific (Abdomen)
  { id: 'ea1', text: '5分钟腹部顺时针按摩', category: 'exercise', intensity: 'low', bodyTypeFocus: 'apple' },
  { id: 'ea2', text: '20次卷腹练习', category: 'exercise', intensity: 'medium', bodyTypeFocus: 'apple' },
  { id: 'ea3', text: '30秒真空腹练习', category: 'exercise', intensity: 'low', bodyTypeFocus: 'apple' },
  { id: 'ea4', text: '今天不喝奶茶', category: 'diet', intensity: 'medium', bodyTypeFocus: 'apple' },

  // Pear Type Specific (Hips/Thighs)
  { id: 'ep1', text: '30次侧卧抬腿（左右各15）', category: 'exercise', intensity: 'medium', bodyTypeFocus: 'pear' },
  { id: 'ep2', text: '5分钟快走（摆动髋部）', category: 'exercise', intensity: 'medium', bodyTypeFocus: 'pear' },
  { id: 'ep3', text: '20次深蹲（重心在脚跟）', category: 'exercise', intensity: 'high', bodyTypeFocus: 'pear' },
  { id: 'ep4', text: '晚餐后散步10分钟', category: 'exercise', intensity: 'low', bodyTypeFocus: 'pear' },

  // Hourglass Type Specific (Toning)
  { id: 'eh1', text: '5分钟全身拉伸瑜伽', category: 'exercise', intensity: 'low', bodyTypeFocus: 'hourglass' },
  { id: 'eh2', text: '10分钟挺拔坐姿挑战', category: 'lifestyle', intensity: 'low', bodyTypeFocus: 'hourglass' },
  { id: 'eh3', text: '3分钟猫牛式伸展', category: 'exercise', intensity: 'low', bodyTypeFocus: 'hourglass' },
  { id: 'eh4', text: '摄入1份优质蛋白（鱼/虾）', category: 'diet', intensity: 'low', bodyTypeFocus: 'hourglass' },

  // Rectangle Type Specific (Waist Definition)
  { id: 'er1', text: '3分钟侧腹部拉伸', category: 'exercise', intensity: 'low', bodyTypeFocus: 'rectangle' },
  { id: 'er2', text: '5分钟腰部扭转练习', category: 'exercise', intensity: 'medium', bodyTypeFocus: 'rectangle' },
  { id: 'er3', text: '2分钟斜方肌放松按摩', category: 'exercise', intensity: 'low', bodyTypeFocus: 'rectangle' },
  { id: 'er4', text: '增加1份牛油果/坚果（优质脂肪）', category: 'diet', intensity: 'low', bodyTypeFocus: 'rectangle' },

  // Lifestyle (6+ tasks)
  { id: 'l1', text: '站着办公/开会10分钟', category: 'lifestyle', intensity: 'medium' },
  { id: 'l2', text: '没久坐超过1小时（起来倒个水）', category: 'lifestyle', intensity: 'low' },
  { id: 'l3', text: '睡前不刷手机超过30分钟', category: 'lifestyle', intensity: 'medium' },
  { id: 'l4', text: '比平时早睡15分钟', category: 'lifestyle', intensity: 'low' },
  { id: 'l5', text: '边工作不狂吃零食', category: 'lifestyle', intensity: 'medium' },
  { id: 'l6', text: '记录今日饮食（随便记，不求精准）', category: 'lifestyle', intensity: 'low' },
];
