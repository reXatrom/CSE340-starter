const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul class=\"nav-list\">"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
// Normalize a DB image path to /images/vehicles/<basename>
function normalizeToVehiclesDir(p) {
  if (!p) return '/images/placeholder.svg'
  // If it already points to /images/vehicles, keep it
  if (p.startsWith('/images/vehicles/')) return p
  // If it starts with /images/, rewrite to /images/vehicles/<basename>
  if (p.startsWith('/images/')) {
    const base = p.split('/').pop()
    return '/images/vehicles/' + base
  }
  // Otherwise, pass-through
  return p
}

Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      // Ensure thumbnails resolve under /images/vehicles/
      let imgPath = normalizeToVehiclesDir(vehicle.inv_thumbnail)
      grid +=  '<a href="/inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + ' details"><img src="' + imgPath
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" onerror="this.onerror=null;this.src=\'/images/placeholder.svg\';" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="/inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* ****************************************
 * Build the vehicle detail view HTML (Week 3)
 **************************************** */
Util.buildDetailView = function(vehicle) {
  if (!vehicle) return "<p>Vehicle not found.</p>";
  const priceUSD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(vehicle.inv_price);
  const milesFmt = new Intl.NumberFormat('en-US').format(vehicle.inv_miles);
  return `
    <section class="vehicle-detail" aria-labelledby="vehicle-title">
      <div class="vehicle-media">
        <img class="hero" src="${normalizeToVehiclesDir(vehicle.inv_image)}" alt="Image of ${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}" onerror="this.onerror=null;this.src='/images/placeholder.svg';" />
      </div>
      <aside class="vehicle-summary">
        <h1 id="vehicle-title" class="vehicle-title">${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h1>
        <div class="price-panel">
          <div class="badge"><span>Mileage</span><strong>${milesFmt}</strong></div>
          <div class="price-row">
            <div class="price-label">No‑Haggle Price</div>
            <div class="price-value">${priceUSD}</div>
          </div>
        </div>
        <ul class="specs">
          <li><strong>Exterior Color:</strong> ${vehicle.inv_color}</li>
          <li><strong>VIN:</strong> ${vehicle.inv_vin}</li>
        </ul>
        <h2 class="desc-heading">Description</h2>
        <p class="desc">${vehicle.inv_description}</p>
        <div class="cta">
          <a href="#" class="btn primary">Start My Purchase</a>
          <a href="#" class="btn">Contact Us</a>
          <a href="#" class="btn">Schedule Test Drive</a>
          <a href="#" class="btn muted" aria-disabled="true">Apply for Financing</a>
        </div>
      </aside>
    </section>
  `;
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util