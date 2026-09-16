import type { PromocaoService, ResultadoValidacaoPromocao } from '@/services/contracts'
import { promocoesMock } from '@/data/mock'
import type { CanalPedido, Promocao } from '@/types'
import { arredondar } from '@/utils/format'
import { simularRede } from './base'

export function calcularDescontoPromocao(promocao: Promocao, subtotal: number): number {
  const bruto = promocao.tipo === 'PERCENTUAL' ? (subtotal * promocao.valor) / 100 : promocao.valor
  return arredondar(Math.min(bruto, subtotal))
}

/**
 * Regras de validação de promoção (fluxo alternativo 12 — benefício inválido/indisponível).
 * Função pura para facilitar testes; usada pelo serviço mock e reutilizável na implementação API.
 */
export function validarPromocao(
  promocoes: Promocao[],
  codigo: string,
  ctx: { unidadeId: number; canal: CanalPedido; subtotal: number; agora?: Date },
): ResultadoValidacaoPromocao {
  const cod = codigo.trim().toUpperCase()
  if (!cod) return { valida: false, promocao: null, desconto: 0, motivo: 'Informe um código promocional.' }
  const promo = promocoes.find((p) => p.codigo === cod)
  if (!promo) return { valida: false, promocao: null, desconto: 0, motivo: 'Código promocional não encontrado.' }
  const agora = ctx.agora ?? new Date()
  if (!promo.ativa || agora < new Date(promo.validadeInicio) || agora > new Date(promo.validadeFim)) {
    return { valida: false, promocao: promo, desconto: 0, motivo: 'Esta promoção não está mais válida.' }
  }
  if (promo.unidadeIds && !promo.unidadeIds.includes(ctx.unidadeId)) {
    return { valida: false, promocao: promo, desconto: 0, motivo: 'Esta promoção não é válida para a unidade selecionada.' }
  }
  if (promo.canais && !promo.canais.includes(ctx.canal)) {
    return { valida: false, promocao: promo, desconto: 0, motivo: `Esta promoção é exclusiva para o canal ${promo.canais.join('/')}.` }
  }
  if (ctx.subtotal < promo.valorMinimoPedido) {
    return {
      valida: false,
      promocao: promo,
      desconto: 0,
      motivo: `Pedido mínimo de R$ ${promo.valorMinimoPedido.toFixed(2).replace('.', ',')} para usar esta promoção.`,
    }
  }
  return { valida: true, promocao: promo, desconto: calcularDescontoPromocao(promo, ctx.subtotal) }
}

export class PromocaoServiceMock implements PromocaoService {
  async listar(unidadeId?: number): Promise<Promocao[]> {
    await simularRede()
    return structuredClone(promocoesMock.filter((p) => unidadeId == null || !p.unidadeIds || p.unidadeIds.includes(unidadeId)))
  }

  async validar(codigo: string, ctx: { unidadeId: number; canal: CanalPedido; subtotal: number }): Promise<ResultadoValidacaoPromocao> {
    await simularRede()
    return validarPromocao(promocoesMock, codigo, ctx)
  }
}
