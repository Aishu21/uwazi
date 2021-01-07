/** @format */

import db from 'api/utils/testing_db';
import SHA256 from 'crypto-js/sha256';

const userId = db.id();
const group1Id = db.id();
const group2Id = db.id();
const recoveryUserId = db.id();
const expectedKey = SHA256(`recovery@email.com${2000}`).toString();

export default {
  users: [
    {
      _id: userId,
      password: 'password',
      username: 'username',
      email: 'test@email.com',
      role: 'admin',
    },
    {
      _id: recoveryUserId,
      password: 'anotherpassword',
      username: 'anotherusername',
      email: 'recovery@email.com',
      role: 'editor',
      using2fa: false,
    },
  ],
  passwordrecoveries: [{ _id: db.id(), key: expectedKey, user: recoveryUserId }],
  settings: [
    { site_name: 'Uwazi instance' }, // eslint-disable-line camelcase
  ],
  usergroups: [
    { _id: group1Id, name: 'Group 1', members: [{ _id: recoveryUserId }] },
    { _id: group2Id, name: 'Group 2', members: [{ _id: userId }] },
  ],
};

export { userId, recoveryUserId, expectedKey, group1Id, group2Id };
