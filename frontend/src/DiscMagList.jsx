import { useNavigate } from 'react-router'
import DiscMagItem from './DiscMagItem'

function DiscMagList({
    discMags,
    loading,
    onRefresh,
    onDelete,
    canManage,
    onAddToCart,
    cartPending
}) {
    const navigate = useNavigate()

    return (
        <div className="card">
            <div className="header">
                <h2>Disc Magazines</h2>

                <div className="actions">
                    <button disabled={loading} onClick={onRefresh}>
                        Refresh
                    </button>

                    {canManage && (
                        <button
                            disabled={loading}
                            onClick={() => navigate('/discmags/add')}
                        >
                            Add Disc Magazine
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Title</th>
                                <th>Price</th>
                                <th>Copies</th>
                                <th>Order Quantity</th>
                                <th>Current Issue</th>
                                <th>Includes Disc</th>
                                <th>Actions</th>
                            </tr>
                            </thead>

                            <tbody>
                            {discMags.map(discMag => (
                                <DiscMagItem
                                    key={discMag.id}
                                    discMag={discMag}
                                    onEdit={id => navigate(`/discmags/edit/${id}`)}
                                    onDelete={onDelete}
                                    canManage={canManage}
                                    onAddToCart={onAddToCart}
                                    cartPending={cartPending}
                                />
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {discMags.length === 0 && (
                        <p>No disc magazines found.</p>
                    )}
                </>
            )}
        </div>
    )
}

export default DiscMagList
