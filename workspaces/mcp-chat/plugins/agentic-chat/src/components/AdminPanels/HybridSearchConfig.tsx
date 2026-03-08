/*
 * Copyright 2025 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';

export interface HybridSearchConfigProps {
  bm25Weight: number;
  semanticWeight: number;
  onBm25WeightChange: (value: number) => void;
  onSemanticWeightChange: (value: number) => void;
}

/**
 * BM25 and semantic weight sliders for hybrid search mode
 */
export function HybridSearchConfig({
  bm25Weight,
  semanticWeight,
  onBm25WeightChange,
  onSemanticWeightChange,
}: HybridSearchConfigProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 2,
        mt: 1.5,
      }}
    >
      <Box>
        <Typography variant="caption" color="textSecondary">
          BM25 Weight: {bm25Weight}
        </Typography>
        <Slider
          size="small"
          min={0}
          max={1}
          step={0.1}
          value={bm25Weight}
          onChange={(_, v) => onBm25WeightChange(v as number)}
        />
      </Box>
      <Box>
        <Typography variant="caption" color="textSecondary">
          Semantic Weight: {semanticWeight}
        </Typography>
        <Slider
          size="small"
          min={0}
          max={1}
          step={0.1}
          value={semanticWeight}
          onChange={(_, v) => onSemanticWeightChange(v as number)}
        />
      </Box>
    </Box>
  );
}
