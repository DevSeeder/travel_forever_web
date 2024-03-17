export class ObjectHelper {
  static isObject(obj) {
    return obj !== null && typeof obj === 'object';
  }

  static diffObject(objetoOriginal, objetoComAlteracoes) {
    const alteracoes = {};
    Object.keys(objetoComAlteracoes).forEach((chave) => {
      const valorOriginal = objetoOriginal[chave];
      const valorAlterado = objetoComAlteracoes[chave];

      if (
        ObjectHelper.isObject(valorOriginal) &&
        ObjectHelper.isObject(valorAlterado)
      ) {
        const diferencaProfunda = ObjectHelper.diffObject(
          valorOriginal,
          valorAlterado
        );

        if (Object.keys(diferencaProfunda).length > 0)
          alteracoes[chave] = diferencaProfunda;
      } else if (valorOriginal !== valorAlterado) {
        alteracoes[chave] = valorAlterado;
        if (alteracoes[chave] == '') alteracoes[chave] = null;
      }
    });

    Object.keys(objetoOriginal).forEach((chave) => {
      if (!(chave in objetoComAlteracoes)) {
        alteracoes[chave] = undefined;
      }
    });

    if (!Object.keys(alteracoes).length) return false;

    return alteracoes;
  }
}
