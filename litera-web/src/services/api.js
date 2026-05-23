import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080' });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('litera_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Preenchido pelo ErroProvider ao montar
api._onErro = null;

/* Mapa de mensagens amigáveis por status HTTP */
const MENSAGENS = {
  400: 'Dados inválidos. Verifique os campos e tente novamente.',
  401: 'Sessão expirada. Faça login novamente.',
  403: 'Você não tem permissão para realizar esta ação.',
  404: 'O recurso solicitado não foi encontrado.',
  409: 'Este registro já existe.',
  422: 'Os dados enviados são inválidos.',
  429: 'Muitas tentativas. Aguarde um momento e tente novamente.',
  500: 'Erro interno do servidor. Tente novamente mais tarde.',
  502: 'Servidor indisponível. Tente novamente em alguns instantes.',
  503: 'Serviço temporariamente fora do ar.',
};

function extrairMensagem(err) {
  const res = err.response;
  if (!res) return 'Não foi possível conectar ao servidor. Verifique sua conexão.';

  // Tenta usar a mensagem do backend (campo "erro")
  const corpo = res.data;
  if (corpo) {
    if (typeof corpo === 'string' && corpo.length < 200) return corpo;
    if (typeof corpo === 'object' && corpo.erro) return corpo.erro;
    if (typeof corpo === 'object' && corpo.message) return corpo.message;
  }

  return MENSAGENS[res.status] || `Erro inesperado (${res.status}). Tente novamente.`;
}

api.interceptors.response.use(
  res => res,
  err => {
    const req = err.config ?? {};
    const res = err.response;
    const metodo = (req.method ?? 'GET').toUpperCase();
    const url = req.url ?? '';
    const status = res?.status;

    // Log técnico completo — só no console para o dev
    console.error(
      `[API] ${metodo} ${url} → ${status ?? 'SEM RESPOSTA'}`,
      '\nResponse:', res?.data,
      '\nStack:', err.stack
    );

    // Mensagem amigável para o usuário (suprimido se _silencioso = true na config)
    if (api._onErro && !req._silencioso) {
      api._onErro({
        mensagem: extrairMensagem(err),
        status,
      });
    }

    return Promise.reject(err);
  }
);

export default api;
