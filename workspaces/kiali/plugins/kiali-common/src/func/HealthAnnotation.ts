/*
 * Copyright 2024 The Backstage Authors
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
import { ToleranceConfig } from '../types';
import {
  HealthAnnotationConfig,
  HealthAnnotationType,
} from '../types/HealthAnnotation';

export class HealthAnnotation {
  healthAnnotations: HealthAnnotationType;

  constructor(annotations: HealthAnnotationType) {
    this.healthAnnotations = annotations;
  }
}

const isNumeric = (val: string): boolean => {
  return !isNaN(Number(val));
};

export class RateHealth extends HealthAnnotation {
  annotation: string;
  isValid: boolean;
  toleranceConfig?: ToleranceConfig[];

  constructor(annotations: HealthAnnotationType) {
    super(annotations);
    this.annotation = annotations[HealthAnnotationConfig.HEALTH_RATE] || '';
    if (this.annotation && this.annotation.length > 0) {
      this.isValid = this.validate();
      this.toleranceConfig = this.isValid
        ? this.getToleranceConfig()
        : undefined;
    } else {
      this.isValid = false;
    }
  }

  validate = () => {
    return !this.annotation
      .split(';')
      .some(annotate => this.isNotValidAnnotation(annotate));
  };

  getToleranceConfig = (): ToleranceConfig[] => {
    const configs: ToleranceConfig[] = [];
    if (this.isValid) {
      this.annotation.split(';').forEach(annotate => {
        const splits = annotate.split(',');
        configs.push({
          code: this.convertRegex(splits[0], true),
          degraded: Number(splits[1]),
          failure: Number(splits[2]),
          protocol: this.convertRegex(splits[3]),
          direction: this.convertRegex(splits[4]),
        });
      });
    }
    return configs;
  };

  private convertRegex = (str: string, code: boolean = false): RegExp => {
    if (code) {
      return new RegExp(str.replace(/x|X/g, '\\d'));
    }
    return new RegExp(str);
  };

  private isNotValidAnnotation = (annotation: string): boolean => {
    const splits = annotation.split(',');
    // Be sure annotation type 4xx,10,20,htpp,inbound
    if (splits.length !== 5) {
      return true;
    }
    // validate Thresholds are numbers and degraded is lower than failure
    if (!(isNumeric(splits[1]) && isNumeric(splits[2]))) {
      return true;
    }
    const degraded = Number(splits[1]);
    const failure = Number(splits[2]);
    return degraded > failure ? true : false;
  };
}
