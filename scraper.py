#!/usr/bin/env python3
"""
Scrape champion data from the MCOC Fandom Wiki API.
Extracts: name, class, tags (gender, size, alignment, affiliation, fighting style), release date.
Outputs: public/data/champions.json
"""

import json
import re
import time
import urllib.request
import urllib.parse
import os

WIKI_API = "https://marvel-contestofchampions.fandom.com/api.php"

# Champion names from the wiki's List of Champions page
CHAMPIONS = [
    "Abomination", "Abomination (Immortal)", "Absorbing Man", "Adam Warlock",
    "Agent Venom", "Air-Walker",
    "America Chavez", "Annihilus", "Ant-Man", "Ant-Man (Future)", "Angela",
    "Anti-Venom", "Apocalypse", "Arcade", "Archangel", "Arnim Zola", "Attuma",
    "Baron Zemo", "Bastion", "Beast", "Beta Ray Bill", "Bishop",
    "Black Cat", "Black Panther", "Black Panther (Civil War)", "Black Bolt",
    "Black Widow", "Black Widow (Claire Voyant)", "Black Widow (Deadly Origin)",
    "Blade", "Blue Marvel", "Bullseye", "Cable",
    "Captain America", "Captain America (Infinity War)", "Captain America (Sam Wilson)",
    "Captain America (WWII)", "Captain Britain", "Captain Marvel",
    "Captain Marvel (Classic)", "Carnage", "Cassandra Nova", "Cassie Lang",
    "Chee'ilth", "Civil Warrior", "Colossus", "Count Nefaria", "Corvus Glaive",
    "Cosmic Ghost Rider", "Crossbones", "Cull Obsidian",
    "Cyclops (Blue Team)", "Cyclops (New Xavier School)",
    "Dani Moonstar", "Daredevil (Classic)", "Daredevil (Hell's Kitchen)",
    "Dark Phoenix", "Darkhawk", "Dazzler", "Deadpool", "Deadpool (X-Force)",
    "Diablo", "Doctor Doom", "Doctor Octopus", "Doctor Strange", "Doctor Voodoo",
    "Domino", "Doombot", "Dormammu", "Dracula", "Dragon Man", "Drax", "Dust",
    "Ebony Maw", "Electro", "Elektra", "Elsa Bloodstone", "Enchantress",
    "Emma Frost", "Falcon", "Falcon (Joaquín Torres)", "Franken-Castle",
    "Gambit", "Gamora", "Galan",
    "Gentle", "Ghost", "Ghost Rider", "Gladiator", "Goldpool", "Gorr",
    "Grandmaster", "Green Goblin", "Groot", "Guardian", "Guillotine",
    "Guillotine (Deathless)", "Guillotine 2099", "Gwenpool",
    "Havok", "Hawkeye", "Heimdall", "Hela", "Hercules", "High Evolutionary",
    "Hit-Monkey", "Howard the Duck", "Hulk", "Hulk (Immortal)",
    "Hulk (Ragnarok)", "Hulkbuster", "Hulkling", "Human Torch", "Hyperion",
    "Iceman", "Ikaris", "Imperiosa", "Invisible Woman",
    "Iron Fist", "Iron Fist (Immortal)", "Iron Man", "Iron Man (Infamous)",
    "Iron Man (Infinity War)", "Iron Patriot", "Ironheart", "Isophyne",
    "Jabari Panther", "Jack O'Lantern", "Jessica Jones", "Jean Grey",
    "Joe Fixit", "Jubilee", "Juggernaut", "Kang the Conqueror",
    "Karolina Dean", "Karnak", "Kate Bishop", "Killmonger", "Kindred",
    "King Groot", "King Groot (Deathless)", "Kingpin", "Kitty Pryde", "Knull", "Korg", "Kraven",
    "Kushala", "Lady Deathstrike", "Lizard", "Loki", "Longshot", "Luke Cage", "Lumatrix",
    "M.O.D.O.K.", "M'Baku", "Madelyne Pryor", "Maestro (Cosmic)", "Magik", "Magneto",
    "Magneto (House of X)", "Man-Thing", "Mangog", "Mantis", "Masacre",
    "Medusa", "Mephisto", "Mister Fantastic", "Mister Negative", "Mister Sinister",
    "Misty Knight", "Mojo", "Mole Man", "Moondragon", "Mordo", "Morningstar",
    "Morbius", "Moon Knight", "Mr. Knight", "Ms. Marvel", "Ms. Marvel (Kamala Khan)", "Mysterio",
    "Namor", "Nebula", "Negasonic Teenage Warhead", "Nick Fury", "Nico Minoru",
    "Night Thrasher", "Nightcrawler", "Nimrod", "Northstar", "Nova",
    "Odin", "Okoye", "Old Man Logan", "Omega Red", "Omega Sentinel", "Onslaught",
    "Patriot", "Peni Parker", "Phoenix", "Photon", "Pixie", "Platinumpool",
    "Professor X", "Prowler", "Proxima Midnight", "Psylocke", "Psycho-Man",
    "Punisher", "Punisher 2099", "Purgatory", "Quake", "Quicksilver",
    "Red Goblin", "Red Guardian", "Red Hulk", "Red Skull", "Rhino", "Rintrah",
    "Rocket Raccoon", "Rogue", "Ronin", "Ronan", "Sabretooth", "Sandman",
    "Sasquatch", "Sauron", "Scarlet Witch", "Scarlet Witch (Classic)", "Scorpion", "Scream",
    "Sentinel", "Sentry", "Sersi", "Shathra", "She-Hulk",
    "She-Hulk (Deathless)", "Shang-Chi", "Shocker", "Shuri", "Silk",
    "Silver Centurion", "Silver Sable", "Silver Samurai", "Silver Surfer", "Solvarch",
    "Sorcerer Supreme", "Spider-Gwen", "Spider-Ham",
    "Spider-Man (Classic)", "Spider-Man (Miles Morales)",
    "Spider-Man (Pavitr Prabhakar)", "Spider-Man (Stark Enhanced)",
    "Spider-Man (Stealth Suit)", "Spider-Man (Symbiote)",
    "Spider-Man (Supreme)", "Spider-Man 2099", "Spider-Punk",
    "Spider-Slayer (J. Jonah Jameson)", "Spider-Woman (Jessica Drew)",
    "Spiral", "Spot", "Squirrel Girl", "Star-Lord",
    "Star-Lord (Stellar-Forged)", "Storm", "Storm (Pyramid X)", "Stryfe",
    "Summoned Symbioid", "Summoned Symbiote",
    "Sunspot", "Super-Skrull", "Superior Iron Man", "Symbiote Supreme",
    "Taskmaster", "Terrax", "The Champion", "The Destroyer", "The Hood",
    "The Leader", "The Maker", "The Overseer", "The Serpent", "Thing",
    "Thanos", "Thanos (Deathless)", "Thor", "Thor (Jane Foster)",
    "Thor (Ragnarok)", "Tigra", "Titania", "Toad",
    "Ultron", "Ultron (Classic)", "Unstoppable Colossus",
    "Valkyrie", "Venom", "Venom the Duck", "Venompool",
    "Vision", "Vision (Aarkus)", "Vision (Age of Ultron)", "Vision (Deathless)",
    "Viv Vision", "Void", "Vox", "Vulture", "War Machine", "Warlock", "Wasp",
    "Werewolf By Night", "White Tiger", "Wiccan", "Winter Soldier",
    "Wolverine", "Wolverine (Weapon X)", "Wolverine (X-23)", "Wong",
    "Yellowjacket", "Yondu", "Yelena Belova", "Ægon",
]

# Known affiliations extracted from wiki tags
AFFILIATION_KEYWORDS = [
    "Avengers", "X-Men", "Defenders", "Fantastic Four", "Guardians of the Galaxy",
    "Sinister Six", "Brotherhood of Mutants", "Inhumans", "Eternals",
    "Spider-Verse", "Symbiote", "S.H.I.E.L.D.", "Hydra", "Asgardian",
    "X-Force", "Champions", "Thunderbolts", "Cabal", "Black Order",
    "Alpha Flight", "New Avengers", "Mighty Avengers", "Dark Avengers",
    "Illuminati", "Marauders", "Hellfire Club", "Kree", "Skrull",
    "Young Avengers", "Starjammers", "Horsemen of Apocalypse",
    "Spider-Verse Heroes", "Spider-Verse Villains",
    "Midnight Sons", "Stark Tech",
]

# Gender mapping for known champions
FEMALE_CHAMPIONS = {
    "America Chavez", "Angela", "Black Cat", "Black Widow",
    "Black Widow (Claire Voyant)", "Black Widow (Deadly Origin)",
    "Captain Marvel", "Captain Marvel (Classic)", "Cassandra Nova", "Cassie Lang",
    "Dani Moonstar", "Dark Phoenix", "Dazzler", "Domino", "Dust",
    "Elektra", "Elsa Bloodstone", "Enchantress", "Emma Frost",
    "Gamora", "Ghost", "Guillotine", "Guillotine (Deathless)",
    "Gwenpool", "Hela", "Invisible Woman", "Ironheart",
    "Jabari Panther", "Jean Grey", "Jessica Jones", "Jubilee",
    "Karolina Dean", "Kate Bishop", "Kitty Pryde", "Kushala",
    "Lady Deathstrike", "Lumatrix", "Madelyne Pryor", "Magik", "Mantis",
    "Medusa", "Misty Knight", "Moondragon", "Morningstar",
    "Ms. Marvel", "Ms. Marvel (Kamala Khan)", "Nebula",
    "Negasonic Teenage Warhead", "Nico Minoru",
    "Okoye", "Omega Sentinel", "Peni Parker", "Photon", "Pixie",
    "Proxima Midnight", "Psylocke", "Purgatory", "Quake",
    "Rogue", "Scarlet Witch", "Scarlet Witch (Classic)", "Scream",
    "Sersi", "Shathra", "She-Hulk", "She-Hulk (Deathless)", "Shuri", "Silk",
    "Sorcerer Supreme", "Spider-Gwen", "Spider-Woman (Jessica Drew)",
    "Spiral", "Squirrel Girl", "Storm", "Storm (Pyramid X)",
    "Tigra", "Titania", "Valkyrie", "Wasp", "White Tiger",
    "Wolverine (X-23)", "Yelena Belova", "Imperiosa", "Isophyne",
    "Captain Britain",
}

# Non-binary / Robot / Other gender
NON_BINARY_CHAMPIONS = {
    "Groot", "King Groot", "King Groot (Deathless)", "Howard the Duck",
    "Man-Thing", "Dragon Man", "Rocket Raccoon", "Spider-Ham",
    "Venom the Duck", "Goldpool", "Platinumpool", "Sentinel", "Nimrod",
    "Ultron", "Ultron (Classic)", "Vision", "Vision (Aarkus)",
    "Vision (Age of Ultron)", "Vision (Deathless)", "Warlock",
    "Guillotine 2099", "Civil Warrior", "Darkhawk",
    "Hit-Monkey", "Sauron", "Mojo", "Dormammu",
    "The Destroyer", "Galan", "Annihilus",
}

FIGHTING_STYLE_MAP = {
    "Offensive: Raw Damage": "Offensive",
    "Offensive: Damage Over Time": "Offensive",
    "Offensive: Burst": "Offensive",
    "Defensive: Guard": "Defensive",
    "Defensive: Utility": "Defensive",
    "Defensive: Tank": "Defensive",
    "Control: Denial": "Control",
    "Control: Counter": "Control",
    "Control: Debuff": "Control",
}


def wiki_page_name(champion_name):
    """Convert champion name to wiki page title."""
    return champion_name.replace(" ", "_")


def fetch_champion_wikitext(champion_name):
    """Fetch wikitext for a champion page from the wiki API."""
    page = wiki_page_name(champion_name)
    params = {
        "action": "parse",
        "page": page,
        "format": "json",
        "prop": "wikitext",
        "section": "0",
    }
    url = f"{WIKI_API}?{urllib.parse.urlencode(params)}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "MCOCdle-Scraper/1.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode())
            if "parse" in data and "wikitext" in data["parse"]:
                return data["parse"]["wikitext"]["*"]
    except Exception as e:
        print(f"  ERROR fetching {champion_name}: {e}")
    return None


def extract_field(wikitext, field_name):
    """Extract a field value from wikitext template."""
    pattern = rf"\|\s*{field_name}\s*=\s*(.+?)(?:\n\||\n\}})"
    match = re.search(pattern, wikitext, re.IGNORECASE | re.DOTALL)
    if match:
        return match.group(1).strip()
    return None


def parse_tags(tags_str):
    """Parse tags string into structured data."""
    if not tags_str:
        return {}

    result = {
        "alignment": "Unknown",
        "size": "M",
        "affiliations": [],
        "fighting_style": "Unknown",
    }

    # Convert <br> separators to commas BEFORE stripping HTML
    tags_str = re.sub(r"<br\s*/?>", ",", tags_str, flags=re.IGNORECASE)

    # Clean wiki markup
    tags_str = re.sub(r"\[\[.*?\|(.*?)\]\]", r"\1", tags_str)
    tags_str = re.sub(r"\[\[(.*?)\]\]", r"\1", tags_str)
    tags_str = re.sub(r"<.*?>", "", tags_str)
    parts = [p.strip() for p in tags_str.split(",")]

    for part in parts:
        part_clean = part.strip().strip(";").strip()

        # Alignment
        if part_clean == "Hero":
            result["alignment"] = "Hero"
        elif part_clean == "Villain":
            result["alignment"] = "Villain"
        elif part_clean == "Mercenary":
            result["alignment"] = "Mercenary"

        # Size
        size_match = re.match(r"Size:\s*(\w+)", part_clean)
        if size_match:
            result["size"] = size_match.group(1)

        # Fighting style
        for style_key, style_val in FIGHTING_STYLE_MAP.items():
            if style_key in part_clean:
                result["fighting_style"] = style_val

        # Affiliations
        for aff in AFFILIATION_KEYWORDS:
            if aff.lower() in part_clean.lower():
                if aff not in result["affiliations"]:
                    result["affiliations"].append(aff)

    return result


def parse_release_year(date_str):
    """Extract year from release date string."""
    if not date_str:
        return None
    match = re.search(r"(\d{4})", date_str)
    if match:
        return int(match.group(1))
    return None


def get_gender(champion_name):
    """Determine gender for a champion."""
    if champion_name in FEMALE_CHAMPIONS:
        return "Female"
    if champion_name in NON_BINARY_CHAMPIONS:
        return "Other"
    return "Male"


def scrape_champion(champion_name):
    """Scrape all attributes for a single champion."""
    wikitext = fetch_champion_wikitext(champion_name)
    if not wikitext:
        return None

    raw_class = extract_field(wikitext, "class")
    # Handle wiki templates like {{Class|Skill}} -> Skill
    class_match = re.match(r"\{\{Class\|(\w+)\}\}", raw_class or "")
    champ_class = class_match.group(1) if class_match else raw_class
    tags_str = extract_field(wikitext, "tags")
    release_date = extract_field(wikitext, "release date")

    tags = parse_tags(tags_str)

    return {
        "name": champion_name,
        "class": champ_class or "Unknown",
        "gender": get_gender(champion_name),
        "size": tags.get("size", "M"),
        "alignment": tags.get("alignment", "Unknown"),
        "affiliations": tags.get("affiliations", []),
        "fighting_style": tags.get("fighting_style", "Unknown"),
        "release_year": parse_release_year(release_date),
    }


def main():
    print(f"Scraping {len(CHAMPIONS)} champions from MCOC Fandom Wiki...")

    champions = []
    failed = []

    for i, name in enumerate(CHAMPIONS):
        print(f"  [{i+1}/{len(CHAMPIONS)}] {name}...")
        data = scrape_champion(name)
        if data:
            champions.append(data)
        else:
            failed.append(name)
        # Rate limit: ~2 requests per second
        time.sleep(0.5)

    # Sort by name
    champions.sort(key=lambda c: c["name"])

    os.makedirs("public/data", exist_ok=True)
    output_path = "public/data/champions.json"
    with open(output_path, "w") as f:
        json.dump(champions, f, indent=2)

    print(f"\nDone! Scraped {len(champions)} champions -> {output_path}")
    if failed:
        print(f"Failed ({len(failed)}): {', '.join(failed)}")

    # Print some stats
    classes = {}
    for c in champions:
        cls = c["class"]
        classes[cls] = classes.get(cls, 0) + 1
    print(f"\nClass distribution: {json.dumps(classes, indent=2)}")


if __name__ == "__main__":
    main()
