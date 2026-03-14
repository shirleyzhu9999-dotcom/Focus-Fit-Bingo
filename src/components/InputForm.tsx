import React, { useState } from 'react';
import { View, Text, Input, Picker, Button } from '@tarojs/components';
import { UserData, BodyType } from '../types';
import { Info, ChevronRight } from 'lucide-react';

interface InputFormProps {
  onSubmit: (data: UserData) => void;
}

export const InputForm: React.FC<InputFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<UserData>({
    height: 165,
    weight: 65,
    targetWeight: 55,
    bodyType: 'rectangle'
  });

  const bodyTypeOptions = [
    { value: 'apple', label: '🍎 苹果型 (腰腹肉肉多)' },
    { value: 'pear', label: '🍐 梨型 (臀腿肉肉多)' },
    { value: 'hourglass', label: '⏳ 沙漏型 (曲线很明显)' },
    { value: 'rectangle', label: '📏 矩形 (整体较匀称)' }
  ];

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <View className="space-y-8 max-w-md mx-auto p-10 bg-white rounded-[3rem] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] border-4 border-black relative overflow-hidden">
      <View className="absolute top-0 left-0 w-32 h-32 bg-candy-pink/5 rounded-full -ml-16 -mt-16" />
      <View className="space-y-6 relative z-10">
        <View className="group">
          <View className="flex items-center gap-2 text-sm font-black text-zinc-500 mb-2 group-focus-within:text-candy-pink transition-colors italic uppercase tracking-widest">
            身高 (cm)
            <View className="group relative">
              <Info size={14} className="text-zinc-300 cursor-help" />
              <View className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-4 bg-black text-white text-[10px] leading-relaxed rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl border border-white font-bold">
                输入你的真实身高，我们将为你精准计算 BMI。
              </View>
            </View>
          </View>
          <Input
            type="number"
            value={formData.height.toString()}
            onInput={(e) => setFormData({ ...formData, height: Number(e.detail.value) })}
            className="w-full px-6 py-4 rounded-2xl bg-zinc-50 border-2 border-black focus:bg-white focus:border-candy-pink focus:outline-none transition-all text-xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          />
        </View>

        <View className="grid grid-cols-2 gap-6">
          <View className="group">
            <View className="flex items-center gap-2 text-sm font-black text-zinc-500 mb-2 group-focus-within:text-candy-cyan transition-colors italic uppercase tracking-widest">
              当前体重 (kg)
            </View>
            <Input
              type="number"
              value={formData.weight.toString()}
              onInput={(e) => setFormData({ ...formData, weight: Number(e.detail.value) })}
              className="w-full px-6 py-4 rounded-2xl bg-zinc-50 border-2 border-black focus:bg-white focus:border-candy-cyan focus:outline-none transition-all text-xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            />
          </View>

          <View className="group">
            <View className="flex items-center gap-2 text-sm font-black text-zinc-500 mb-2 group-focus-within:text-candy-green transition-colors italic uppercase tracking-widest">
              目标体重 (kg)
            </View>
            <Input
              type="number"
              value={formData.targetWeight.toString()}
              onInput={(e) => setFormData({ ...formData, targetWeight: Number(e.detail.value) })}
              className="w-full px-6 py-4 rounded-2xl bg-zinc-50 border-2 border-black focus:bg-white focus:border-candy-green focus:outline-none transition-all text-xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            />
          </View>
        </View>

        <View className="group">
          <View className="flex items-center gap-2 text-sm font-black text-zinc-500 mb-2 group-focus-within:text-candy-yellow transition-colors italic uppercase tracking-widest">
            体型选择
          </View>
          <View className="relative">
            <Picker
              mode="selector"
              range={bodyTypeOptions}
              rangeKey="label"
              onChange={(e) => setFormData({ ...formData, bodyType: bodyTypeOptions[Number(e.detail.value)].value as BodyType })}
            >
              <View className="w-full px-6 py-4 rounded-2xl bg-zinc-50 border-2 border-black focus:bg-white focus:border-candy-yellow focus:outline-none transition-all text-xl font-black appearance-none cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center">
                <Text>{bodyTypeOptions.find(o => o.value === formData.bodyType)?.label}</Text>
                <ChevronRight size={24} strokeWidth={3} className="rotate-90" />
              </View>
            </Picker>
          </View>
        </View>
      </View>

      <Button
        onClick={handleSubmit}
        className="w-full flex items-center justify-center gap-3 py-6 bg-candy-pink hover:bg-candy-pink/90 text-white font-black text-xl rounded-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none italic relative overflow-hidden group mt-8"
      >
        <View className="absolute inset-0 candy-gloss opacity-40 group-hover:opacity-60" />
        <View className="relative z-10 flex items-center justify-center gap-3">
          <Text>生成我的专属 Bingo</Text>
          <ChevronRight size={28} strokeWidth={4} />
        </View>
      </Button>
    </View>
  );
};
