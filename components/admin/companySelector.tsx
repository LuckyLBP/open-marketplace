
interface CompanySelectorProps {
    companies: { id: string; email: string }[];
    selectedCompanyId: string;
    onChange: (id: string) => void;
}

export const CompanySelector: React.FC<CompanySelectorProps> = ({
    companies,
    selectedCompanyId,
    onChange,
}) => (
    <div>
        <label className="block font-medium mb-1">Företag</label>
        <select
            className="w-full border rounded-md p-2"
            value={selectedCompanyId}
            onChange={(e) => onChange(e.target.value)}
        >
            <option value="all">Visa alla</option>
            {companies.map((c) => (
                <option key={c.id} value={c.id}>
                    {c.email}
                </option>
            ))}
        </select>
    </div>
);
