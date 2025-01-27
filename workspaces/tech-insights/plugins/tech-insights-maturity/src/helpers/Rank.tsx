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
import { Rank } from '@backstage-community/plugin-tech-insights-maturity-common';
import Bronze from '../img/bronze.png';
import Gold from '../img/gold.png';
import Silver from '../img/silver.png';
import Stone from '../img/stone.png';

const RankImg = {
  Stone,
  Bronze,
  Silver,
  Gold,
};

const getRankImg = (rank?: Rank) => {
  let img;
  switch (rank) {
    case Rank.Bronze:
      img = RankImg.Bronze;
      break;
    case Rank.Silver:
      img = RankImg.Silver;
      break;
    case Rank.Gold:
      img = RankImg.Gold;
      break;
    default:
      img = RankImg.Stone;
      break;
  }
  return img;
};

export default getRankImg;
