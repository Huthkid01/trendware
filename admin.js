document.addEventListener('DOMContentLoaded', async () => {
  // ================== CONFIGURE SUPABASE ==================
  const SUPABASE_URL = 'https://yxpftrlfkqrvoolzxqsj.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4cGZ0cmxma3Fydm9vbHp4cXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MDUwMjAsImV4cCI6MjA4MTA4MTAyMH0.0I87bU6pnpwY7wYZLv0ZEF-MOOeUZkjTKrfjgFIheKY';

  const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // ================== DOM ELEMENTS ==================
  const contentSection = document.getElementById('contentSection');
  const saveStatus = document.getElementById('saveStatus');
  const logoutBtn = document.getElementById('logoutBtn');

  const heroTitleInput = document.getElementById('heroTitleInput');
  const heroSubtitleInput = document.getElementById('heroSubtitleInput');
  const heroButtonTextInput = document.getElementById('heroButtonTextInput');
  const collectionsTitleInput = document.getElementById('collectionsTitleInput');
  const aboutTitleInput = document.getElementById('aboutTitleInput');
  const aboutTextInput = document.getElementById('aboutTextInput');
  const footerTaglineInput = document.getElementById('footerTaglineInput');
  const footerSubtaglineInput = document.getElementById('footerSubtaglineInput');
  const footerEmailInput = document.getElementById('footerEmailInput');
  const footerPhoneInput = document.getElementById('footerPhoneInput');
  const footerHoursInput = document.getElementById('footerHoursInput');
  const footerBottomInput = document.getElementById('footerBottomInput');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');

  const productsTableBody = document.getElementById('productsTableBody');

  const productForm = document.getElementById('productForm');
  const productIdInput = document.getElementById('productId');
  const productNameInput = document.getElementById('productName');
  const productCategoryInput = document.getElementById('productCategory');
  const productPriceNGNInput = document.getElementById('productPriceNGN');
  const productPriceUSDInput = document.getElementById('productPriceUSD');
  const productPriceGBPInput = document.getElementById('productPriceGBP');
  const productImageFileInput = document.getElementById('productImageFile');
  const productImageUrlInput = document.getElementById('productImageUrl');
  const productSizesInput = document.getElementById('productSizes');
  const cancelEditBtn = document.getElementById('cancelEditBtn');

  // we will scroll to this form on Edit
  const productFormSection = productForm;

  // ================== AUTH: CHECK SESSION ==================
  const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();

  if (!session) {
    // Not logged in → send back to login page
    window.location.href = 'login.html';
    return;
  }

  console.log('Admin logged in as:', session.user.email);

  if (contentSection) {
    contentSection.style.display = 'block';
  }

  // Logout button
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await supabaseClient.auth.signOut();
      window.location.href = 'login.html';
    });
  }

  // ================== SITE SETTINGS ==================
  async function loadSettings() {
    const { data, error } = await supabaseClient
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .single();

    console.log('loadSettings result', { data, error });

    if (error || !data) {
      saveStatus.textContent = 'Could not load site text (first time is ok).';
      return;
    }

    heroTitleInput.value = data.hero_title || '';
    heroSubtitleInput.value = data.hero_subtitle || '';
    heroButtonTextInput.value = data.hero_button_text || '';
    collectionsTitleInput.value = data.collections_title || '';
    aboutTitleInput.value = data.about_title || '';
    aboutTextInput.value = data.about_paragraph || '';
    footerTaglineInput.value = data.footer_tagline || '';
    footerSubtaglineInput.value = data.footer_subtagline || '';
    footerEmailInput.value = data.footer_contact_email || '';
    footerPhoneInput.value = data.footer_contact_phone || '';
    footerHoursInput.value = data.footer_opening_hours || '';
    footerBottomInput.value = data.footer_bottom || '';
  }

  saveSettingsBtn.addEventListener('click', async () => {
    saveStatus.textContent = 'Saving site text...';

    const payload = {
      id: 1,
      hero_title: heroTitleInput.value,
      hero_subtitle: heroSubtitleInput.value,
      hero_button_text: heroButtonTextInput.value,
      collections_title: collectionsTitleInput.value,
      about_title: aboutTitleInput.value,
      about_paragraph: aboutTextInput.value,
      footer_tagline: footerTaglineInput.value,
      footer_subtagline: footerSubtaglineInput.value,
      footer_contact_email: footerEmailInput.value,
      footer_contact_phone: footerPhoneInput.value,
      footer_opening_hours: footerHoursInput.value,
      footer_bottom: footerBottomInput.value
    };

    const { error } = await supabaseClient
      .from('site_settings')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      saveStatus.textContent = 'Save failed: ' + error.message;
      return;
    }

    saveStatus.textContent = 'Site text saved.';
  });

  // ================== PRODUCTS ==================
  async function loadProductsForAdmin() {
    const { data, error } = await supabaseClient
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      saveStatus.textContent = 'Failed to load products: ' + error.message;
      return;
    }

    productsTableBody.innerHTML = data
      .map(
        (p) => `
      <tr data-id="${p.id}">
        <td>
          ${
            p.image_url
              ? `<img src="${p.image_url}" alt="${p.name}" class="admin-product-thumb">`
              : `<div class="admin-product-thumb"></div>`
          }
        </td>
        <td>
          <div><strong>${p.name}</strong></div>
          <div style="font-size:0.8rem;color:#6b7280;">${p.category}</div>
        </td>
        <td>
          <div>₦${p.price_ngn}</div>
          <div style="font-size:0.8rem;color:#6b7280;">$${p.price_usd} · £${p.price_gbp}</div>
        </td>
        <td>${p.sizes || ''}</td>
        <td>
          <button type="button" class="admin-action-btn edit" data-id="${p.id}">Edit</button>
          <button type="button" class="admin-action-btn delete" data-id="${p.id}">Delete</button>
        </td>
      </tr>
    `
      )
      .join('');

    productsTableBody.querySelectorAll('.admin-action-btn.edit').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.id);
        const product = data.find((p) => p.id === id);
        startEditProduct(product);
      });
    });

    productsTableBody.querySelectorAll('.admin-action-btn.delete').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.id);
        deleteProduct(id);
      });
    });
  }

  async function uploadProductImage(file) {
    if (!file) return null;

    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabaseClient.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Image upload failed:', uploadError);
      saveStatus.textContent = 'Image upload failed: ' + uploadError.message;
      return null;
    }

    const { data } = supabaseClient.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    saveStatus.textContent = 'Saving product...';

    let imageUrl = productImageUrlInput.value;
    const file = productImageFileInput.files[0];

    if (file) {
      const uploadedUrl = await uploadProductImage(file);
      if (!uploadedUrl) return;
      imageUrl = uploadedUrl;
      productImageUrlInput.value = uploadedUrl;
    }

    const payload = {
      name: productNameInput.value,
      category: productCategoryInput.value,
      price_ngn: Number(productPriceNGNInput.value),
      price_usd: Number(productPriceUSDInput.value) || 0,
      price_gbp: Number(productPriceGBPInput.value) || 0,
      image_url: imageUrl,
      sizes: productSizesInput.value
    };

    let error;
    if (productIdInput.value) {
      const { error: updError } = await supabaseClient
        .from('products')
        .update(payload)
        .eq('id', Number(productIdInput.value));
      error = updError;
    } else {
      const { error: insError } = await supabaseClient
        .from('products')
        .insert(payload);
      error = insError;
    }

    if (error) {
      saveStatus.textContent = 'Product save failed: ' + error.message;
      return;
    }

    saveStatus.textContent = 'Product saved.';
    productIdInput.value = '';
    productForm.reset();
    productImageUrlInput.value = '';
    await loadProductsForAdmin();
  });

  function startEditProduct(p) {
    productIdInput.value = p.id;
    productNameInput.value = p.name;
    productCategoryInput.value = p.category;
    productPriceNGNInput.value = p.price_ngn;
    productPriceUSDInput.value = p.price_usd || 0;
    productPriceGBPInput.value = p.price_gbp || 0;
    productImageUrlInput.value = p.image_url || '';
    productImageFileInput.value = '';
    productSizesInput.value = p.sizes || '';

    // Scroll smoothly to the Add / Edit Product form
    if (productFormSection) {
      productFormSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  async function deleteProduct(id) {
    if (!confirm('Delete this product?')) return;

    const { error } = await supabaseClient
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      saveStatus.textContent = 'Delete failed: ' + error.message;
      return;
    }

    saveStatus.textContent = 'Product deleted.';
    await loadProductsForAdmin();
  }

  cancelEditBtn.addEventListener('click', () => {
    productIdInput.value = '';
    productForm.reset();
    productImageUrlInput.value = '';
  });

  // Finally: load initial data once session is confirmed
  await loadSettings();
  await loadProductsForAdmin();
});
