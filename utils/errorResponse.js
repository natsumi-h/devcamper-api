// Errorクラスを継承したErrorResponseというクラス（オブジェクトを生成する関数）
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    // 親クラスErrorのパラメーターmessageを呼び出す
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ErrorResponse;
