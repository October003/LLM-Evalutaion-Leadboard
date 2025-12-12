import { useMemo } from "react";
import {
  looksLikeRegex,
  parseSearchQuery,
  getValueByPath,
} from "../utils/searchUtils";
import { ALLOWED_MODELS, isModelAllowed } from "../constants/allowedModels";

const HARDCODED_SCORES={
"基因结构域1.1":{"Gemini-2.5-Flash-nothinking":81.25,"GPT-3.5-Turbo":68.75,"GPT-4.1-mini":78.98,"DeepSeek-V3-671B":75.57,"Qwen3-235B-a22b":77.84,"GPT-oss-20B":61.93,"GPT-oss-120B":89.20,"GLM-4-0414-9B":52.84,"LLaMA3.1-8B":66.48,"LLaMA3.2-1B":43.18,"LLaMA3.2-3B":55.68,"DeepSeek-R1-Distill-Qwen-1.5B":37.50,"DeepSeek-R1-Distill-Qwen-7B":34.09,"DeepSeek-R1-Distill-LLaMA-8B":47.16,"DeepSeek-R1-Distill-Qwen-14B":59.66,"DeepSeek-R1-0528-Qwen3-8B":61.36,"Qwen2.5-Instruct-0.5B":40.34,"Qwen2.5-Instruct-1.5B":57.39,"Qwen2.5-Instruct-3B":60.23,"Qwen2.5-Instruct-7B":61.93,"Qwen2.5-Instruct-14B":70.45,"Qwen2.5-Instruct-72B":74.43,"Qwen3-0.6B":48.30,"Qwen3-1.7B":41.48,"Qwen3-4B":60.80,"Qwen3-8B":63.64,"Qwen3-14B":74.43,"QwQ-32B":67.61},
"基因染色体定位1.2":{"Gemini-2.5-Flash-nothinking":94.00,"GPT-3.5-Turbo":39.00,"GPT-4.1-mini":83.00,"DeepSeek-V3-671B":90.00,"Qwen3-235B-a22b":72.00,"GPT-oss-20B":37.00,"GPT-oss-120B":95.00,"GLM-4-0414-9B":26.00,"LLaMA3.1-8B":28.00,"LLaMA3.2-1B":31.00,"LLaMA3.2-3B":17.00,"DeepSeek-R1-Distill-Qwen-1.5B":16.00,"DeepSeek-R1-Distill-Qwen-7B":29.00,"DeepSeek-R1-Distill-LLaMA-8B":23.00,"DeepSeek-R1-Distill-Qwen-14B":45.00,"DeepSeek-R1-0528-Qwen3-8B":27.00,"Qwen2.5-Instruct-0.5B":34.00,"Qwen2.5-Instruct-1.5B":29.00,"Qwen2.5-Instruct-3B":30.00,"Qwen2.5-Instruct-7B":42.00,"Qwen2.5-Instruct-14B":83.00,"Qwen2.5-Instruct-72B":88.00,"Qwen3-0.6B":18.00,"Qwen3-1.7B":34.00,"Qwen3-4B":39.00,"Qwen3-8B":30.00,"Qwen3-14B":70.00,"QwQ-32B":51.00},
"顺势调控元件2.1":{"Gemini-2.5-Flash-nothinking":60.26,"GPT-3.5-Turbo":42.31,"GPT-4.1-mini":67.95,"DeepSeek-V3-671B":65.38,"Qwen3-235B-a22b":69.23,"GPT-oss-20B":30.77,"GPT-oss-120B":74.36,"GLM-4-0414-9B":55.13,"LLaMA3.1-8B":37.18,"LLaMA3.2-1B":19.23,"LLaMA3.2-3B":21.79,"DeepSeek-R1-Distill-Qwen-1.5B":21.79,"DeepSeek-R1-Distill-Qwen-7B":34.62,"DeepSeek-R1-Distill-LLaMA-8B":41.03,"DeepSeek-R1-Distill-Qwen-14B":44.87,"DeepSeek-R1-0528-Qwen3-8B":56.41,"Qwen2.5-Instruct-0.5B":34.62,"Qwen2.5-Instruct-1.5B":53.85,"Qwen2.5-Instruct-3B":58.97,"Qwen2.5-Instruct-7B":48.72,"Qwen2.5-Instruct-14B":56.41,"Qwen2.5-Instruct-72B":60.26,"Qwen3-0.6B":38.46,"Qwen3-1.7B":39.74,"Qwen3-4B":41.03,"Qwen3-8B":52.56,"Qwen3-14B":53.85,"QwQ-32B":57.69},
"反式作用因子2.2":{"Gemini-2.5-Flash-nothinking":85.71,"GPT-3.5-Turbo":48.05,"GPT-4.1-mini":92.21,"DeepSeek-V3-671B":83.12,"Qwen3-235B-a22b":89.61,"GPT-oss-20B":45.45,"GPT-oss-120B":93.51,"GLM-4-0414-9B":27.27,"LLaMA3.1-8B":57.14,"LLaMA3.2-1B":22.08,"LLaMA3.2-3B":27.27,"DeepSeek-R1-Distill-Qwen-1.5B":38.96,"DeepSeek-R1-Distill-Qwen-7B":24.68,"DeepSeek-R1-Distill-LLaMA-8B":31.17,"DeepSeek-R1-Distill-Qwen-14B":61.04,"DeepSeek-R1-0528-Qwen3-8B":28.57,"Qwen2.5-Instruct-0.5B":37.66,"Qwen2.5-Instruct-1.5B":42.86,"Qwen2.5-Instruct-3B":58.44,"Qwen2.5-Instruct-7B":66.23,"Qwen2.5-Instruct-14B":71.43,"Qwen2.5-Instruct-72B":76.62,"Qwen3-0.6B":20.78,"Qwen3-1.7B":50.65,"Qwen3-4B":58.44,"Qwen3-8B":58.44,"Qwen3-14B":72.73,"QwQ-32B":71.43},
"调控元件功能验证2.3":{"Gemini-2.5-Flash-nothinking":96.59,"GPT-3.5-Turbo":95.45,"GPT-4.1-mini":95.45,"DeepSeek-V3-671B":94.32,"Qwen3-235B-a22b":93.18,"GPT-oss-20B":62.50,"GPT-oss-120B":98.86,"GLM-4-0414-9B":84.09,"LLaMA3.1-8B":85.23,"LLaMA3.2-1B":26.14,"LLaMA3.2-3B":87.00,"DeepSeek-R1-Distill-Qwen-1.5B":56.82,"DeepSeek-R1-Distill-Qwen-7B":54.55,"DeepSeek-R1-Distill-LLaMA-8B":61.36,"DeepSeek-R1-Distill-Qwen-14B":92.05,"DeepSeek-R1-0528-Qwen3-8B":88.64,"Qwen2.5-Instruct-0.5B":65.91,"Qwen2.5-Instruct-1.5B":87.50,"Qwen2.5-Instruct-3B":97.73,"Qwen2.5-Instruct-7B":89.77,"Qwen2.5-Instruct-14B":95.45,"Qwen2.5-Instruct-72B":97.73,"Qwen3-0.6B":72.73,"Qwen3-1.7B":81.82,"Qwen3-4B":90.91,"Qwen3-8B":88.64,"Qwen3-14B":94.32,"QwQ-32B":92.05},
"功能基因组学3.1":{"Gemini-2.5-Flash-nothinking":90.57,"GPT-3.5-Turbo":93.40,"GPT-4.1-mini":93.40,"DeepSeek-V3-671B":92.45,"Qwen3-235B-a22b":93.40,"GPT-oss-20B":89.62,"GPT-oss-120B":97.17,"GLM-4-0414-9B":68.87,"LLaMA3.1-8B":72.64,"LLaMA3.2-1B":50.94,"LLaMA3.2-3B":69.81,"DeepSeek-R1-Distill-Qwen-1.5B":32.05,"DeepSeek-R1-Distill-Qwen-7B":33.02,"DeepSeek-R1-Distill-LLaMA-8B":54.72,"DeepSeek-R1-Distill-Qwen-14B":77.36,"DeepSeek-R1-0528-Qwen3-8B":50.94,"Qwen2.5-Instruct-0.5B":51.89,"Qwen2.5-Instruct-1.5B":61.32,"Qwen2.5-Instruct-3B":66.04,"Qwen2.5-Instruct-7B":52.83,"Qwen2.5-Instruct-14B":80.19,"Qwen2.5-Instruct-72B":87.74,"Qwen3-0.6B":66.04,"Qwen3-1.7B":65.09,"Qwen3-4B":68.87,"Qwen3-8B":69.81,"Qwen3-14B":80.19,"QwQ-32B":82.08},
"系统遗传学3.2":{"Gemini-2.5-Flash-nothinking":99.05,"GPT-3.5-Turbo":85.71,"GPT-4.1-mini":98.10,"DeepSeek-V3-671B":98.10,"Qwen3-235B-a22b":98.10,"GPT-oss-20B":82.86,"GPT-oss-120B":98.10,"GLM-4-0414-9B":84.76,"LLaMA3.1-8B":91.43,"LLaMA3.2-1B":43.81,"LLaMA3.2-3B":89.52,"DeepSeek-R1-Distill-Qwen-1.5B":60.95,"DeepSeek-R1-Distill-Qwen-7B":54.29,"DeepSeek-R1-Distill-LLaMA-8B":87.62,"DeepSeek-R1-Distill-Qwen-14B":94.29,"DeepSeek-R1-0528-Qwen3-8B":89.52,"Qwen2.5-Instruct-0.5B":75.24,"Qwen2.5-Instruct-1.5B":80.95,"Qwen2.5-Instruct-3B":80.00,"Qwen2.5-Instruct-7B":76.19,"Qwen2.5-Instruct-14B":95.24,"Qwen2.5-Instruct-72B":92.38,"Qwen3-0.6B":61.90,"Qwen3-1.7B":70.48,"Qwen3-4B":87.62,"Qwen3-8B":93.33,"Qwen3-14B":88.57,"QwQ-32B":97.14},
"功能获得与缺失功能验证3.3":{"Gemini-2.5-Flash-nothinking":94.44,"GPT-3.5-Turbo":77.78,"GPT-4.1-mini":95.56,"DeepSeek-V3-671B":92.22,"Qwen3-235B-a22b":91.11,"GPT-oss-20B":90.00,"GPT-oss-120B":95.56,"GLM-4-0414-9B":77.78,"LLaMA3.1-8B":81.11,"LLaMA3.2-1B":48.89,"LLaMA3.2-3B":78.89,"DeepSeek-R1-Distill-Qwen-1.5B":17.78,"DeepSeek-R1-Distill-Qwen-7B":37.78,"DeepSeek-R1-Distill-LLaMA-8B":63.33,"DeepSeek-R1-Distill-Qwen-14B":80.00,"DeepSeek-R1-0528-Qwen3-8B":81.11,"Qwen2.5-Instruct-0.5B":60.00,"Qwen2.5-Instruct-1.5B":81.11,"Qwen2.5-Instruct-3B":85.56,"Qwen2.5-Instruct-7B":85.56,"Qwen2.5-Instruct-14B":86.67,"Qwen2.5-Instruct-72B":85.56,"Qwen3-0.6B":65.56,"Qwen3-1.7B":76.67,"Qwen3-4B":86.67,"Qwen3-8B":88.89,"Qwen3-14B":93.33,"QwQ-32B":81.11},
"同源基因与表型的关联4.1":{"Gemini-2.5-Flash-nothinking":82.47,"GPT-3.5-Turbo":67.01,"GPT-4.1-mini":86.60,"DeepSeek-V3-671B":78.35,"Qwen3-235B-a22b":85.57,"GPT-oss-20B":71.13,"GPT-oss-120B":87.63,"GLM-4-0414-9B":57.73,"LLaMA3.1-8B":68.04,"LLaMA3.2-1B":32.99,"LLaMA3.2-3B":44.33,"DeepSeek-R1-Distill-Qwen-1.5B":41.24,"DeepSeek-R1-Distill-Qwen-7B":38.14,"DeepSeek-R1-Distill-LLaMA-8B":45.36,"DeepSeek-R1-Distill-Qwen-14B":65.98,"DeepSeek-R1-0528-Qwen3-8B":55.67,"Qwen2.5-Instruct-0.5B":43.30,"Qwen2.5-Instruct-1.5B":56.70,"Qwen2.5-Instruct-3B":70.10,"Qwen2.5-Instruct-7B":72.16,"Qwen2.5-Instruct-14B":76.29,"Qwen2.5-Instruct-72B":69.07,"Qwen3-0.6B":40.21,"Qwen3-1.7B":60.82,"Qwen3-4B":63.92,"Qwen3-8B":75.26,"Qwen3-14B":75.26,"QwQ-32B":81.44},
"基因的效应与表型的关联4.2":{"Gemini-2.5-Flash-nothinking":94.74,"GPT-3.5-Turbo":90.53,"GPT-4.1-mini":95.79,"DeepSeek-V3-671B":96.84,"Qwen3-235B-a22b":95.79,"GPT-oss-20B":83.16,"GPT-oss-120B":97.89,"GLM-4-0414-9B":71.58,"LLaMA3.1-8B":76.84,"LLaMA3.2-1B":54.74,"LLaMA3.2-3B":69.47,"DeepSeek-R1-Distill-Qwen-1.5B":31.58,"DeepSeek-R1-Distill-Qwen-7B":31.58,"DeepSeek-R1-Distill-LLaMA-8B":60.00,"DeepSeek-R1-Distill-Qwen-14B":74.74,"DeepSeek-R1-0528-Qwen3-8B":67.37,"Qwen2.5-Instruct-0.5B":42.11,"Qwen2.5-Instruct-1.5B":60.00,"Qwen2.5-Instruct-3B":70.53,"Qwen2.5-Instruct-7B":83.16,"Qwen2.5-Instruct-14B":76.84,"Qwen2.5-Instruct-72B":91.58,"Qwen3-0.6B":56.84,"Qwen3-1.7B":67.37,"Qwen3-4B":82.11,"Qwen3-8B":88.42,"Qwen3-14B":90.53,"QwQ-32B":94.74}
};

// Calculate min/max averages
export const useAverageRange = (data) => {
  return useMemo(() => {
    const averages = data.map((item) => item.model.average_score);
    // console.log("useAverageRange --> data",data)
    // console.log("useAverageRange",averages)
    return {
      minAverage: Math.min(...averages),
      maxAverage: Math.max(...averages),
    };
  }, [data]);
};

// Generate colors for scores
export const useColorGenerator = (minAverage, maxAverage) => {
  return useMemo(() => {
    const colorCache = new Map();
    return (value) => {

// console.log(
//   "%c[getColorForValue] INPUT",
//   "color: red; font-weight: bold;",
//   { value, type: typeof value }
// );

      const cached = colorCache.get(value);
      if (cached) return cached;

      const normalizedValue = (value - minAverage) / (maxAverage - minAverage);
      const red = Math.round(255 * (1 - normalizedValue) * 1);
      const green = Math.round(255 * normalizedValue) * 1;
      // const color = `rgba(${red}, ${green}, 0, 1)`;
      const color = `rgba(${red}, 0, ${green}, 1)`;
      colorCache.set(value, color);
// console.log(
//   "%c[getColorForValue] ",
//   "color: green; font-weight: bold;",
//   { color, type: typeof color}
// );
      return color;
    };
  }, [minAverage, maxAverage]);
};

// Process data with boolean standardization
export const useProcessedData = (data, averageMode, visibleColumns) => {
  return useMemo(() => {
    // 直接使用硬编码数据创建模型列表
    const modelList = [];
    
    // 从HARDCODED_SCORES中获取所有模型名称
    const modelNames = new Set();
    Object.values(HARDCODED_SCORES).forEach(categoryData => {
      Object.entries(categoryData).forEach(([modelName, score]) => {
        // 添加所有模型，不管分数是否为0
        modelNames.add(modelName);
      });
    });
    // 为每个模型创建条目
    Array.from(modelNames).forEach((modelName, index) => {
      
      // 1. 自动从所有任务读取评分
      const hardcodedEvaluations = {};
      Object.keys(HARDCODED_SCORES).forEach(taskName => {
        hardcodedEvaluations[taskName] ={
          value: HARDCODED_SCORES[taskName][modelName] ?? null
          // HARDCODED_SCORES[taskName][modelName] ?? null;
        };
      });
      // 2. 自动计算总平均分
      const scores = Object.values(hardcodedEvaluations).filter(s => s != null);
      const valueArray = scores.map(score => score.value)
      // console.log("%c[getValueArray] ", "color: blue; font-weight: bold;", {
      //   valueArray,
      //   type: typeof valueArray[0]
      // });
      const averageScore = valueArray.length > 0 
        ? valueArray.reduce((sum, value) => sum + value, 0) / valueArray.length 
        : null;
  // const averageScore = scores.length > 0 
  // ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
  // : null;
      // console.log("averageScore",averageScore)
      // 3. 构造模型对象
      modelList.push({
        id: `model-${index}`,
        model: {
          name: modelName,
          average_score: averageScore,
          type: "chat",
        },
        evaluations: hardcodedEvaluations,
        features: {
          is_moe: false,
          is_flagged: false,
          is_highlighted_by_maintainer: false,
          is_merged: false,
          is_not_available_on_hub: false,
        },
        metadata: {
          submission_date: new Date().toISOString(),
        },
        isMissing: false,
      });
    });

    // 根据平均分排序
    modelList.sort((a, b) => {
      if (a.model.average_score === null && b.model.average_score === null)
        return 0;
      if (a.model.average_score === null) return 1;
      if (b.model.average_score === null) return -1;
      return b.model.average_score - a.model.average_score;
    });

    // 添加排名
    return modelList.map((item, index) => ({
      ...item,
      static_rank: index + 1,
    }));
  }, [data, averageMode, visibleColumns]);
};

// 辅助函数：从硬编码数据中获取分数
function getHardcodedScore(modelName, category) {
  if (!HARDCODED_SCORES[category]) return null;
  
  // 尝试精确匹配
  if (HARDCODED_SCORES[category][modelName] !== undefined) {
    return HARDCODED_SCORES[category][modelName];
  }
  
  // 尝试部分匹配
  for (const key in HARDCODED_SCORES[category]) {
    if (modelName.includes(key) || key.includes(modelName)) {
      return HARDCODED_SCORES[category][key];
    }
  }
  
  return null;
}

// Common filtering logic
export const useFilteredData = (
  processedData,
  selectedPrecisions,
  selectedTypes,
  paramsRange,
  searchValue,
  selectedBooleanFilters,
  rankingMode,
  pinnedModels = [],
  isOfficialProviderActive = false
) => {
  return useMemo(() => {
    // 由于使用的是硬编码数据，这里直接返回所有数据而不进行过滤
    return processedData.map((item, index) => ({
          ...item,
      dynamic_rank: index + 1,
      rank: rankingMode === "static" ? item.static_rank : index + 1,
          isPinned: pinnedModels.includes(item.id),
    }));
  }, [
    processedData,
    rankingMode,
    pinnedModels,
  ]);
};

// Column visibility management
export const useColumnVisibility = (visibleColumns = []) => {
  // Create secure visibility object
  const columnVisibility = useMemo(() => {
    // Check visible columns
    const safeVisibleColumns = Array.isArray(visibleColumns)
      ? visibleColumns
      : [];

    const visibility = {};
    try {
      safeVisibleColumns.forEach((columnKey) => {
        if (typeof columnKey === "string") {
          visibility[columnKey] = true;
        }
      });
    } catch (error) {
      console.warn("Error in useColumnVisibility:", error);
    }
    return visibility;
  }, [visibleColumns]);

  return columnVisibility;
};
