import { User } from '../schemas/user';
import { getLocalStorageData } from '../storage';

import { processGET } from './service';

export const getPortabilityButton = async (token: string): Promise<string> => {
  return await processGET<string>({
    path: '/portability_button/button',
    tokenOverride: token,
  });
};

export const getPortabilityData = async (token): Promise<User> => {
  return await processGET<User>({
    path: '/portability/data/',
    tokenOverride: token,
  });
};
