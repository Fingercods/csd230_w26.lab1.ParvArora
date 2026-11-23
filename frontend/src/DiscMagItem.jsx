
function DiscMagItem({ discMag, onEdit, onDelete }) {
    return (
        <tr>
            <td>{discMag.id}</td>
            <td>{discMag.title}</td>
            <td>${Number(discMag.price ?? 0).toFixed(2)}</td>
            <td>{discMag.copies}</td>
            <td>{discMag.orderQty}</td>
            <td>
                {discMag.currentIssue
                    ? String(discMag.currentIssue).replace('T', ' ').slice(0, 16)
                    : '-'}
            </td>
            <td>{discMag.hasDisc ? 'Yes' : 'No'}</td>
            <td>
                <div className="actions">
                    <button onClick={() => onEdit(discMag.id)}>
                        Edit
                    </button>
                    <button
                        className="delete"
                        onClick={() => onDelete(discMag.id)}
                    >
                        Delete
                    </button>
                </div>
            </td>
        </tr>
    )
}

export default DiscMagItem
