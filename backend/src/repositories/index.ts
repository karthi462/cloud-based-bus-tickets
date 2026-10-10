import { CONFIG } from '../config/constants.js';
import { IRepository } from './repositoryInterface.js';
import { LocalRepository } from './localRepository.js';
import { DynamoRepository } from './dynamoRepository.js';

let repositoryInstance: IRepository | null = null;

export const getRepository = (): IRepository => {
  if (!repositoryInstance) {
    if (CONFIG.USE_DYNAMODB) {
      console.log('Connecting to AWS DynamoDB repository...');
      repositoryInstance = new DynamoRepository();
    } else {
      console.log('Using Local Persistent JSON Repository (Zero-AWS Local Dev Mode)...');
      repositoryInstance = new LocalRepository();
    }
  }
  return repositoryInstance;
};

export const setRepository = (repo: IRepository): void => {
  repositoryInstance = repo;
};
