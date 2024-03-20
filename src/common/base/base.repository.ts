import { v4 as uuidv4 } from 'uuid';

export abstract class BaseRepository {
  generateUUID() {
    return uuidv4();
  }
}
