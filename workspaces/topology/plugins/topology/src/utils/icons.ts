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
import defaultImg from '../imgs/logos/defaulthub.svg';
import djangoImg from '../imgs/logos/django.svg';
import dotnetImg from '../imgs/logos/dotnet.svg';
import drupalImg from '../imgs/logos/drupal.svg';
import goLangImg from '../imgs/logos/golang.svg';
import grailsImg from '../imgs/logos/grails.svg';
import jbossImg from '../imgs/logos/jboss.svg';
import jrubyImg from '../imgs/logos/jruby.svg';
import jsImg from '../imgs/logos/js.svg';
import nginxImg from '../imgs/logos/nginx.svg';
import nodejsImg from '../imgs/logos/nodejs.svg';
import openjdkImg from '../imgs/logos/openjdk.svg';
import perlImg from '../imgs/logos/perl.svg';
import phalconImg from '../imgs/logos/phalcon.svg';
import phpImg from '../imgs/logos/php.svg';
import pythonImg from '../imgs/logos/python.svg';
import quarkusImg from '../imgs/logos/quarkus.svg';
import railsImg from '../imgs/logos/rails.svg';
import redisImg from '../imgs/logos/redis.svg';
import rhSpringBoot from '../imgs/logos/rh-spring-boot.svg';
import rubyImg from '../imgs/logos/ruby.svg';
import rustImg from '../imgs/logos/rust.svg';
import springBootImg from '../imgs/logos/spring-boot.svg';
import springImg from '../imgs/logos/spring.svg';

const logos = new Map<string, any>()
  .set('icon-django', djangoImg)
  .set('icon-dotnet', dotnetImg)
  .set('icon-drupal', drupalImg)
  .set('icon-go-gopher', goLangImg)
  .set('icon-golang', goLangImg)
  .set('icon-grails', grailsImg)
  .set('icon-jboss', jbossImg)
  .set('icon-jruby', jrubyImg)
  .set('icon-js', jsImg)
  .set('icon-nginx', nginxImg)
  .set('icon-nodejs', nodejsImg)
  .set('icon-openjdk', openjdkImg)
  .set('icon-perl', perlImg)
  .set('icon-phalcon', phalconImg)
  .set('icon-php', phpImg)
  .set('icon-python', pythonImg)
  .set('icon-quarkus', quarkusImg)
  .set('icon-rails', railsImg)
  .set('icon-redis', redisImg)
  .set('icon-rh-spring-boot', rhSpringBoot)
  .set('icon-rust', rustImg)
  .set('icon-java', openjdkImg)
  .set('icon-rh-openjdk', openjdkImg)
  .set('icon-ruby', rubyImg)
  .set('icon-spring', springImg)
  .set('icon-spring-boot', springBootImg)
  .set('icon-default', defaultImg);

export const getImageForIconClass = (iconClass: string): string => {
  return logos.get(iconClass);
};
