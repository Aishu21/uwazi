import api from 'app/utils/api';

export default {
  get(id) {
    const params = {};
    if (id) {
      params._id = id;
    }

    return api.get('relationtypes', params)
    .then(response => response.json.rows);
  },

  save(relationType) {
    return api.post('relationtypes', relationType)
    .then(response => response.json);
  },

  delete(relationType) {
    return api.delete('relationtypes', { _id: relationType._id })
    .then(response => response.json);
  }
};
