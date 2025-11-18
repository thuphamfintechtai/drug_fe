import PropTypes from "prop-types";
import TruckLoader from "../../shared/components/TruckLoader";
import {
  formatAddress,
  formatDate,
  formatDateTime,
  formatNumber,
  shortenTx,
} from "../../utils/helper";
import { supplyChainHistory } from "../constants/supplyChainHistory";

const { stageMeta } = supplyChainHistory;

const translateStatus = (status) => {
  const map = {
    completed: "Hoàn thành",
    confirmed: "Đã xác nhận",
    pending: "Đang chờ",
    draft: "Bản nháp",
    sent: "Đã gửi",
    issued: "Đã phát hành",
    in_transit: "Đang vận chuyển",
    received: "Đã nhận",
    verified: "Đã xác minh",
    cancelled: "Đã hủy",
  };
  if (!status) {
    return "—";
  }
  return map[status] || status;
};

function InfoRow({ label, value, mono = false, link }) {
  if (!value) {
    return null;
  }
  const valueClass = mono
    ? "font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
    : "font-medium text-slate-800";

  const content = link ? (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={`${valueClass} hover:underline`}
    >
      {value}
    </a>
  ) : (
    <span className={valueClass}>{value}</span>
  );

  return (
    <div className="flex flex-wrap items-start gap-2 text-sm text-slate-600">
      <span className="min-w-[120px] text-slate-500">{label}:</span>
      {content}
    </div>
  );
}

function ProofBlock({ proof }) {
  if (!proof) {
    return null;
  }

  const receiverName =
    typeof proof.receivedBy === "string"
      ? proof.receivedBy
      : proof.receivedBy?.name || proof.receivedBy?.username || null;

  return (
    <div className="mt-4 rounded-lg border border-card-primary bg-emerald-50 p-4">
      <h5 className="text-sm font-semibold text-emerald-700 mb-2">
        Thông tin xác nhận
      </h5>
      <div className="space-y-2">
        <InfoRow
          label="Thời gian"
          value={formatDateTime(proof.receivedAt || proof.completedAt)}
        />
        <InfoRow label="Người nhận" value={receiverName} />
        {typeof proof.receivedBy === "object" && proof.receivedBy?.idNumber && (
          <InfoRow label="Mã định danh" value={proof.receivedBy.idNumber} />
        )}
        <InfoRow label="Mã xác nhận" value={proof.verificationCode} />
        <InfoRow
          label="Địa chỉ nhận"
          value={formatAddress(proof.deliveryAddress || proof.receiptAddress)}
        />
        {proof.qualityCheck?.condition && (
          <InfoRow
            label="Kiểm định chất lượng"
            value={translateStatus(proof.qualityCheck.condition)}
          />
        )}
        <InfoRow
          label="Tx Blockchain"
          value={shortenTx(proof.transferTxHash || proof.receiptTxHash)}
          mono
          link={
            proof.transferTxHash || proof.receiptTxHash
              ? `https://sepolia.etherscan.io/tx/${
                  proof.transferTxHash || proof.receiptTxHash
                }`
              : undefined
          }
        />
        <InfoRow label="Trạng thái" value={translateStatus(proof.status)} />
      </div>
    </div>
  );
}

function renderStageDetails(stage) {
  const { details = {}, proof } = stage;
  switch (stage.stage) {
    case "production":
      return (
        <>
          <InfoRow label="Số lô" value={details.batchNumber} />
          <InfoRow label="Số lượng" value={formatNumber(details.quantity)} />
          <InfoRow label="Ngày sản xuất" value={formatDate(details.mfgDate)} />
          <InfoRow label="Hạn dùng" value={formatDate(details.expDate)} />
          <InfoRow
            label="Báo cáo QA"
            value={details.qaReportUri}
            link={details.qaReportUri}
          />
          <InfoRow
            label="Tx Blockchain"
            value={shortenTx(details.chainTxHash)}
            mono
            link={
              details.chainTxHash
                ? `https://sepolia.etherscan.io/tx/${details.chainTxHash}`
                : undefined
            }
          />
          <ProofBlock proof={proof} />
        </>
      );
    case "transfer_to_distributor":
      return (
        <>
          <InfoRow label="Nhà phân phối" value={stage.entity?.name} />
          <InfoRow label="Số HĐ" value={details.invoiceNumber} mono />
          <InfoRow label="Ngày HĐ" value={formatDate(details.invoiceDate)} />
          <InfoRow label="Số lượng" value={formatNumber(details.quantity)} />
          <InfoRow
            label="Địa chỉ giao"
            value={formatAddress(details.deliveryAddress)}
          />
          <InfoRow
            label="Phương thức vận chuyển"
            value={details.shippingMethod}
          />
          <InfoRow
            label="Dự kiến giao"
            value={formatDate(details.estimatedDelivery)}
          />
          {Array.isArray(details.nfts) && details.nfts.length > 0 && (
            <InfoRow
              label="NFT liên quan"
              value={`${details.nfts.length} mã`}
            />
          )}
          <InfoRow
            label="Tx Blockchain"
            value={shortenTx(details.chainTxHash)}
            mono
            link={
              details.chainTxHash
                ? `https://sepolia.etherscan.io/tx/${details.chainTxHash}`
                : undefined
            }
          />
          <ProofBlock proof={proof} />
        </>
      );
    case "transfer_to_pharmacy":
      return (
        <>
          <InfoRow label="Nhà thuốc" value={stage.entity?.name} />
          <InfoRow label="Số HĐ" value={details.invoiceNumber} mono />
          <InfoRow label="Số lượng" value={formatNumber(details.quantity)} />
          <InfoRow
            label="Địa chỉ giao"
            value={formatAddress(details.deliveryAddress)}
          />
          <InfoRow
            label="Phương thức vận chuyển"
            value={details.shippingMethod}
          />
          <InfoRow
            label="Tx Blockchain"
            value={shortenTx(details.chainTxHash)}
            mono
            link={
              details.chainTxHash
                ? `https://sepolia.etherscan.io/tx/${details.chainTxHash}`
                : undefined
            }
          />
          <InfoRow
            label="Hoàn tất chuỗi cung ứng"
            value={details.supplyChainCompleted ? "Có" : "Chưa"}
          />
          <ProofBlock proof={proof} />
        </>
      );
    default:
      return (
        <>
          {Object.entries(details).map(([key, value]) => (
            <InfoRow key={key} label={key} value={String(value)} />
          ))}
          <ProofBlock proof={proof} />
        </>
      );
  }
}

function renderStatistics(stats) {
  if (!stats) {
    return null;
  }

  const cards = [
    { label: "Tổng NFT", value: stats.totalNFTs },
    { label: "Minted", value: stats.nftsByStatus?.minted ?? 0 },
    { label: "Đã chuyển giao", value: stats.nftsByStatus?.transferred ?? 0 },
    { label: "Đã bán", value: stats.nftsByStatus?.sold ?? 0 },
    { label: "Số NPP tham gia", value: stats.distributorsInvolved ?? 0 },
    { label: "Số Nhà thuốc tham gia", value: stats.pharmaciesInvolved ?? 0 },
    {
      label: "Lần chuyển tới NPP",
      value: stats.transfersToDistributors ?? 0,
    },
    {
      label: "Lần chuyển tới Nhà thuốc",
      value: stats.transfersToPharmacies ?? 0,
    },
    { label: "Chuỗi đã hoàn tất", value: stats.completedSupplyChains ?? 0 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-slate-200 bg-slate-50 p-4"
        >
          <div className="text-xs uppercase tracking-wide text-slate-500">
            {card.label}
          </div>
          <div className="mt-1 text-lg font-semibold text-slate-800">
            {formatNumber(card.value)}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SupplyChainJourney({ journey, isLoading }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <TruckLoader height={48} showTrack progress={0.6} />
      </div>
    );
  }

  if (!journey) {
    return (
      <div className="py-6 text-sm text-slate-500">
        Chưa có dữ liệu hành trình cho lô hàng này.
      </div>
    );
  }

  const { batchInfo, statistics, timeline, nfts } = journey;

  return (
    <div className="mt-6 border-t border-slate-200 pt-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoRow label="Nhà sản xuất" value={batchInfo?.manufacturer?.name} />
        <InfoRow
          label="Mã số giấy phép"
          value={batchInfo?.manufacturer?.licenseNo}
        />
        <InfoRow label="Ngày sản xuất" value={formatDate(batchInfo?.mfgDate)} />
        <InfoRow label="Hạn dùng" value={formatDate(batchInfo?.expDate)} />
        <InfoRow
          label="Tổng số lượng"
          value={formatNumber(batchInfo?.quantity)}
        />
        <InfoRow
          label="Tx Blockchain"
          value={shortenTx(batchInfo?.chainTxHash)}
          mono
          link={
            batchInfo?.chainTxHash
              ? `https://sepolia.etherscan.io/tx/${batchInfo.chainTxHash}`
              : undefined
          }
        />
      </div>

      {renderStatistics(statistics)}

      <div>
        <h4 className="text-base font-semibold text-slate-800 mb-4">
          Timeline chuỗi cung ứng
        </h4>
        {(!timeline || timeline.length === 0) && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            Chưa có hoạt động nào sau bước sản xuất.
          </div>
        )}
        <div className="relative">
          {timeline && timeline.length > 0 && (
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-linear-to-b from-cyan-300 via-blue-300 to-purple-300" />
          )}
          <div className="space-y-4">
            {timeline?.map((stage) => {
              const meta = stageMeta[stage.stage] || stageMeta.default;
              const stageStatus =
                stage.details?.status ||
                stage.status ||
                stage.proof?.status ||
                (stage.stage === "production" ? "completed" : undefined);

              return (
                <div
                  key={`${stage.stage}-${stage.step}`}
                  className="relative flex gap-4"
                >
                  <div className="relative z-10 shrink-0">
                    <div
                      className={`w-12 h-12 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-xl ${meta.color}`}
                    >
                      {meta.icon}
                    </div>
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold border ${meta.color}`}
                          >
                            {meta.label}
                          </span>
                          {stageStatus && (
                            <span className="px-2 py-0.5 rounded text-xs bg-emerald-100 text-emerald-700">
                              {translateStatus(stageStatus)}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500">
                          {formatDateTime(
                            stage.timestamp || batchInfo?.createdAt
                          )}
                        </span>
                      </div>

                      <div className="mt-4 space-y-2">
                        <InfoRow label="Đơn vị" value={stage.entity?.name} />
                        <InfoRow
                          label="Địa chỉ"
                          value={formatAddress(stage.entity?.address)}
                        />
                        {renderStageDetails(stage)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-base font-semibold text-slate-800 mb-3">
          Danh sách NFT (tối đa 10)
        </h4>
        {(!nfts || nfts.length === 0) && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            Chưa có NFT nào được ghi nhận cho lô hàng này.
          </div>
        )}
        {nfts && nfts.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Token ID</th>
                  <th className="px-4 py-2 text-left font-medium">Serial</th>
                  <th className="px-4 py-2 text-left font-medium">
                    Trạng thái
                  </th>
                  <th className="px-4 py-2 text-left font-medium">
                    Chủ sở hữu
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {nfts.slice(0, 10).map((nft) => (
                  <tr key={nft.tokenId}>
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">
                      {nft.tokenId}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">
                      {nft.serialNumber}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {translateStatus(nft.status)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {nft.currentOwner?.username ||
                        nft.currentOwner?.email ||
                        "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {nfts.length > 10 && (
              <div className="text-xs text-slate-500 mt-2">
                Hiển thị 10 NFT gần nhất trong tổng số{" "}
                {formatNumber(nfts.length)}.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

InfoRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.node,
  ]),
  mono: PropTypes.bool,
  link: PropTypes.string,
};

ProofBlock.propTypes = {
  proof: PropTypes.shape({
    receivedBy: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        name: PropTypes.string,
        username: PropTypes.string,
        idNumber: PropTypes.string,
      }),
    ]),
    receivedAt: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.instanceOf(Date),
    ]),
    completedAt: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.instanceOf(Date),
    ]),
    verificationCode: PropTypes.string,
    deliveryAddress: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    receiptAddress: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    qualityCheck: PropTypes.shape({
      condition: PropTypes.string,
    }),
    transferTxHash: PropTypes.string,
    receiptTxHash: PropTypes.string,
    status: PropTypes.string,
  }),
};

SupplyChainJourney.propTypes = {
  journey: PropTypes.shape({
    batchInfo: PropTypes.shape({
      manufacturer: PropTypes.shape({
        name: PropTypes.string,
        licenseNo: PropTypes.string,
      }),
      mfgDate: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.instanceOf(Date),
      ]),
      expDate: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.instanceOf(Date),
      ]),
      quantity: PropTypes.number,
      chainTxHash: PropTypes.string,
      createdAt: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.instanceOf(Date),
      ]),
    }),
    statistics: PropTypes.shape({
      totalNFTs: PropTypes.number,
      nftsByStatus: PropTypes.shape({
        minted: PropTypes.number,
        transferred: PropTypes.number,
        sold: PropTypes.number,
      }),
      distributorsInvolved: PropTypes.number,
      pharmaciesInvolved: PropTypes.number,
      transfersToDistributors: PropTypes.number,
      transfersToPharmacies: PropTypes.number,
      completedSupplyChains: PropTypes.number,
    }),
    timeline: PropTypes.arrayOf(
      PropTypes.shape({
        stage: PropTypes.string,
        step: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        entity: PropTypes.shape({
          name: PropTypes.string,
          address: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        }),
        details: PropTypes.object,
        proof: PropTypes.object,
        timestamp: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number,
          PropTypes.instanceOf(Date),
        ]),
        status: PropTypes.string,
      })
    ),
    nfts: PropTypes.arrayOf(
      PropTypes.shape({
        tokenId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        serialNumber: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        status: PropTypes.string,
        currentOwner: PropTypes.shape({
          username: PropTypes.string,
          email: PropTypes.string,
        }),
      })
    ),
  }),
  isLoading: PropTypes.bool,
};
