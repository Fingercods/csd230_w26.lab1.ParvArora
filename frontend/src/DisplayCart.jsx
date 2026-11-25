export default function DisplayCart({ cart, onRemove, loading }) {
    const products = cart?.products || [];

    const total = products.reduce(
        (sum, product) => sum + Number(product.price || 0),
        0
    );

    return (
        <div className="card">
            <h2>My Cart ({products.length})</h2>

            {loading ? (
                <p>Loading cart...</p>
            ) : products.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Product</th>
                                    <th>Price</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {products.map(product => (
                                    <tr key={product.id}>
                                        <td>{product.id}</td>
                                        <td>
                                            {product.title || product.description}
                                        </td>
                                        <td>
                                            ${Number(product.price).toFixed(2)}
                                        </td>
                                        <td>
                                            <button
                                                className="delete"
                                                disabled={loading}
                                                onClick={() => onRemove(product.id)}
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <h3>Total: ${total.toFixed(2)}</h3>
                </>
            )}
        </div>
    );
}
