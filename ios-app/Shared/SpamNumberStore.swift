import Foundation

/// Lista privativa de números que o usuário MARCOU manualmente como suspeitos.
/// Nunca declara que todo número desconhecido é fraude. Não há upload de contatos.
enum SpamNumberStore {
    static let appGroup = "group.com.educamaisdigital.educa"
    static let key = "educa.userMarkedSuspectedNumbers.v1"
    static let maximumEntries = 1_000

    static func digits(_ raw: String) -> String {
        raw.filter { $0 >= "0" && $0 <= "9" }
    }

    /// E.164 sem +. Brasil: telefone com DDD (10 ou 11 dígitos) recebe 55.
    /// Outros países: exigir +código do país explicitamente.
    static func normalize(_ raw: String) -> String? {
        let cleaned = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        let numbers = digits(cleaned)
        guard numbers.count >= 8 && numbers.count <= 15 else { return nil }

        var result = numbers
        if !cleaned.hasPrefix("+") && !numbers.hasPrefix("55") {
            guard numbers.count == 10 || numbers.count == 11 else { return nil }
            result = "55" + numbers
        }
        guard result.count >= 10 && result.count <= 15,
              result.first != "0",
              Int64(result) != nil else { return nil }
        // Rejeita entradas obviamente fictícias ou sem informação.
        guard Set(result).count > 3 else { return nil }
        return result
    }

    static func read() -> [String] {
        guard let defaults = UserDefaults(suiteName: appGroup) else { return [] }
        let raw = defaults.stringArray(forKey: key) ?? []
        let verified = raw.compactMap(normalize)
        return Array(Set(verified)).sorted()
    }

    @discardableResult
    static func write(_ values: [String]) -> Bool {
        guard let defaults = UserDefaults(suiteName: appGroup) else { return false }
        let verified = Array(Set(values.compactMap(normalize))).sorted()
        guard verified.count <= maximumEntries else { return false }
        defaults.set(verified, forKey: key)
        return true
    }

    static func display(_ number: String) -> String {
        "+" + number
    }
}
