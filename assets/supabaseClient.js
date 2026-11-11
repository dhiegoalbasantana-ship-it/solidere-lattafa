/**
 * SOLIDERE ATACADISTA x LATTAFA BRASIL - SUPABASE CLIENT
 * Registro automático de leads, pedidos e orçamentos para atendimento WhatsApp
 */

const SUPABASE_CONFIG = {
  url: window.ENV_SUPABASE_URL || "https://ycgleyqbexglfxoqlghn.supabase.co",
  anonKey: window.ENV_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljZ2xleXFiZXhnbGZ4b3FsZ2huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ0MTE3MzYsImV4cCI6MjExMDAzMDM3Nn0.placeholder"
};

let supabaseClient = null;

function getSupabase() {
  if (supabaseClient) return supabaseClient;

  if (window.supabase && SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey && !SUPABASE_CONFIG.url.includes("SEU_PROJETO")) {
    try {
      supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
      console.log("✨ [Solidere Atacadista] Conectado ao Supabase com sucesso!");
    } catch (e) {
      console.warn("⚠️ [Solidere Atacadista] Falha ao inicializar Supabase:", e);
    }
  }
  return supabaseClient;
}

/**
 * Registra um pedido ou orçamento no Supabase antes de abrir o WhatsApp
 */
async function recordOrderToSupabase(orderData) {
  const sb = getSupabase();
  if (!sb) return null;

  try {
    const randomCode = 'SOL-' + Math.floor(100000 + Math.random() * 900000);
    const payload = {
      order_code: randomCode,
      customer_name: orderData.customerName || 'Cliente Site',
      customer_phone: orderData.customerPhone || null,
      order_type: orderData.isWholesale ? 'ATACADO' : 'VAREJO',
      items: orderData.items || [],
      items_count: orderData.itemsCount || 1,
      subtotal: orderData.subtotal || 0.00,
      notes: orderData.notes || '',
      status: 'novo',
      source: 'site_solidere_lattafa'
    };

    const { data, error } = await sb
      .from('leads_solidere')
      .insert([payload])
      .select('order_code')
      .single();

    if (error) {
      console.warn("Aviso Supabase (tabela em criação ou offline):", error.message);
      return randomCode;
    }

    console.log("✅ Pedido registrado no Supabase com código:", data.order_code);
    return data.order_code;
  } catch (err) {
    console.warn("Erro ao registrar no Supabase:", err);
    return 'SOL-' + Math.floor(100000 + Math.random() * 900000);
  }
}

window.getSupabase = getSupabase;
window.recordOrderToSupabase = recordOrderToSupabase;
