export const USER = {
  NICKNAME: {
    MIN_LENGTH: 3,
    MIN_LENGTH_MESSAGE: 'Please choose a longer nickname',

    EXIST_MESSAGE: 'Nickname already in use!',
    INCORRECT_MESSAGE: 'Incorrect nickname',
  },

  EMAIL: {
    EXIST_MESSAGE: 'Email address already in use!',
  },

  PASSWORD: {
    MIN_LENGTH: 7,
    MIN_LENGTH_MESSAGE: 'Please choose a longer password',

    CONFIRMATION_MESSAGE: 'Password confirmation doesn\'t match Password',
    HASH_MESSAGE: 'Can\'t hash password',
    INCORRECT_MESSAGE: 'Incorrect password',
  },

  NOT_EXIST: 'User doesn\'t exist',
}

export const BLOB = {
  PATH: {
    EXIST_MESSAGE: 'Pathname already create!',
  },

  PASSWORD: {
    MIN_LENGTH: 7,
    MIN_LENGTH_MESSAGE: 'Please choose a longer password',
    CONFIRMATION_MESSAGE: 'Password confirmation doesn\'t match Password',
    HASH_MESSAGE: 'Can\'t hash password',
  },
}
