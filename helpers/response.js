export function success(resources, meta) {
  return { data: resources, meta }
}

export function error({ status, code }, fields, description = 'missing') {
  return {
    err: {
      status,
      code,
      description,
      fields,
    },
  }
}
