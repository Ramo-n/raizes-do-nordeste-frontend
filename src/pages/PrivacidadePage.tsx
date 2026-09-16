import { Link } from 'react-router-dom'
import { ROTAS } from '@/routes/paths'

/** Política de Privacidade — visível na interface (Fase 9, RN06). Descreve o que a aplicação realmente faz. */
export function PrivacidadePage() {
  return (
    <article className="container-estreito prosa" aria-labelledby="priv-titulo" style={{ maxWidth: 760 }}>
      <h1 id="priv-titulo">Política de Privacidade</h1>
      <p className="texto-suave">
        Última atualização: 2026 · Aplicação acadêmica da Rede Raízes do Nordeste (Projeto Multidisciplinar — Trilha Front-End). Este documento explica, em linguagem simples,
        como seus dados pessoais são tratados, conforme a Lei nº 13.709/2018 (LGPD).
      </p>

      <h2>1. Quais dados coletamos e para quê</h2>
      <div style={{ overflowX: 'auto' }}>
        <table className="tabela">
          <thead>
            <tr>
              <th>Dado</th>
              <th>Finalidade</th>
              <th>Base legal</th>
              <th>Obrigatório?</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Nome</td>
              <td>Identificar você na retirada do pedido</td>
              <td>Execução de contrato</td>
              <td>Sim</td>
            </tr>
            <tr>
              <td>E-mail</td>
              <td>Acesso à conta e confirmação do pedido</td>
              <td>Execução de contrato</td>
              <td>Sim</td>
            </tr>
            <tr>
              <td>Senha</td>
              <td>Proteger o acesso (armazenada com hash no Back-End)</td>
              <td>Execução de contrato</td>
              <td>Sim</td>
            </tr>
            <tr>
              <td>Data de nascimento</td>
              <td>Ofertas de aniversário na fidelidade</td>
              <td>Consentimento</td>
              <td>Não</td>
            </tr>
            <tr>
              <td>Histórico de pedidos</td>
              <td>Acumular pontos e calcular descontos</td>
              <td>Consentimento (programa de fidelidade)</td>
              <td>Não</td>
            </tr>
            <tr>
              <td>Unidade, carrinho e sessão</td>
              <td>Manter seu pedido em andamento no dispositivo</td>
              <td>Legítimo interesse</td>
              <td>Técnico</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>2. O que NÃO coletamos</h2>
      <ul>
        <li>Dados de cartão, CPF ou informações financeiras — o pagamento é feito por um serviço externo (nesta versão acadêmica, simulado).</li>
        <li>Localização em segundo plano, contatos ou dados de outros aplicativos.</li>
        <li>Cookies de rastreamento ou publicidade de terceiros.</li>
      </ul>

      <h2>3. Onde os dados ficam</h2>
      <p>
        No seu dispositivo (armazenamento local do navegador) ficam apenas a unidade escolhida, o carrinho, a sessão de acesso e a preferência de canal. No Back-End da rede ficam
        cadastro, pedidos e pontos de fidelidade. Nesta versão de demonstração, os dados “do servidor” são simulados no próprio navegador (Mock Data).
      </p>

      <h2>4. Seus direitos</h2>
      <ul>
        <li>Confirmar a existência de tratamento e acessar seus dados.</li>
        <li>Corrigir dados incompletos ou desatualizados.</li>
        <li>Revogar o consentimento do programa de fidelidade a qualquer momento.</li>
        <li>Solicitar a anonimização ou eliminação dos dados pessoais.</li>
      </ul>
      <p>
        Você exerce esses direitos em <Link to={ROTAS.conta}>Meus dados</Link>. A anonimização remove nome e e-mail dos registros e encerra o programa de fidelidade.
      </p>

      <h2>5. Compartilhamento</h2>
      <p>
        Compartilhamos com o serviço de pagamento apenas o identificador do pedido e o valor. A unidade recebe seu nome (ou apelido) para chamar na retirada. Não vendemos dados
        pessoais.
      </p>

      <h2>6. Contato</h2>
      <p>Encarregado de dados (DPO): privacidade@raizesdonordeste.example (endereço fictício — projeto acadêmico).</p>
    </article>
  )
}
